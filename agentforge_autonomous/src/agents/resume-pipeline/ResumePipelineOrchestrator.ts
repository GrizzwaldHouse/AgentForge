import { agentEventBus } from "@/core/events/agent-event-bus";
import { loadConfig } from "../../../apps/job-agent/config/config-loader";
import { ResumeSelectionAgent } from "./ResumeSelectionAgent";
import { VmockRunnerAgent } from "./VmockRunnerAgent";
import type { ResumeApprovedEvent, ResumeFailedEvent } from "./resume-pipeline-events";

/** Input required to start the resume sub-pipeline for a single job. */
export interface RunForJobInput {
  /** Unique job identifier in slug form (e.g. "acme-engineer-2026-06-01"). */
  jobId: string;
  /** Raw job description text used for resume selection and VMock JD paste. */
  jdText: string;
}

/** Result returned by runForJob after the pipeline completes or fails. */
export interface RunForJobResult {
  /** True if the resume passed VMock threshold within maxIterations. */
  approved: boolean;
  /** The VMock score from the last iteration (0 if pipeline failed early). */
  finalScore: number;
  /** Absolute path to the resume used in the final iteration. */
  finalResumePath: string;
  /** Total number of VMock iterations attempted (including the passing one). */
  totalIterations: number;
  /** Ordered log messages from all sub-agents for observability. */
  logs: string[];
}

/**
 * ResumePipelineOrchestrator
 *
 * Coordinates the A5 resume sub-pipeline:
 *   1. ResumeSelectionAgent (A5a): picks the best resume variant from the vault
 *      using HF cosine similarity.
 *   2. VmockRunnerAgent (A5b): uploads the selected resume to VMock, reads the
 *      score and feedback, takes an evidence screenshot.
 *   3. Iteration loop: if the score is below config.resume.vmockPassThreshold and
 *      iterations remain, loops back to step 2 (same resume, same JD).
 *
 * Events emitted:
 *   - resume.approved  when score >= vmockPassThreshold
 *   - resume.failed    when selection fails, runner fails, or maxIterations exceeded
 *
 * This orchestrator is fired as a parallel side-effect from JobPipelineOrchestrator
 * when a job.ingested event arrives. It does NOT block the proposal pipeline (A2-A4).
 */
export class ResumePipelineOrchestrator {
  private selector = new ResumeSelectionAgent();
  private runner = new VmockRunnerAgent();

  /**
   * Run the full resume pipeline for a single job.
   *
   * @param input - jobId and jdText for the target job
   * @returns RunForJobResult with approved flag, finalScore, and logs
   */
  async runForJob(input: RunForJobInput): Promise<RunForJobResult> {
    const config = loadConfig();
    const logs: string[] = [];
    const { jobId, jdText } = input;
    const maxIterations = config.resume.maxIterations;
    const passThreshold = config.resume.vmockPassThreshold;
    const now = () => new Date().toISOString();

    logs.push(`Resume orchestrator: Starting pipeline for job ${jobId}`);

    // Step 1: Select best resume variant from vault
    const selectionResult = await this.selector.execute({
      taskId: `resume-select-${jobId}`,
      context: { jobId, jdText },
    });

    if (!selectionResult.success) {
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: "Resume selection failed -- check vault path and HF token",
        lastScore: 0,
        failedAt: now(),
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { approved: false, finalScore: 0, finalResumePath: "", totalIterations: 0, logs };
    }

    const selectedData = selectionResult.data as { selectedResumePath: string; matchScore: number };
    const resumePath = selectedData.selectedResumePath;
    logs.push(`Resume orchestrator: Selected ${resumePath} (score ${selectedData.matchScore.toFixed(4)})`);

    let lastScore = 0;
    let iteration = 0;

    // Step 2+: Iteration loop -- upload to VMock, check score, repeat if needed
    while (iteration < maxIterations) {
      iteration++;
      logs.push(`Resume orchestrator: VMock iteration ${iteration}/${maxIterations}`);

      const runResult = await this.runner.execute({
        taskId: `vmock-run-${jobId}-v${iteration}`,
        context: { jobId, resumePath, jdText, iterationNumber: iteration },
      });

      if (!runResult.success) {
        const evt: ResumeFailedEvent = {
          type: "resume.failed",
          jobId,
          reason: `VMock runner failed on iteration ${iteration}`,
          lastScore,
          failedAt: now(),
        };
        (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
        return { approved: false, finalScore: lastScore, finalResumePath: resumePath, totalIterations: iteration, logs };
      }

      const runData = runResult.data as { score: number; feedback: string[] };
      lastScore = runData.score;
      logs.push(`Resume orchestrator: VMock score ${lastScore} (threshold ${passThreshold})`);

      if (lastScore >= passThreshold) {
        const approvedEvent: ResumeApprovedEvent = {
          type: "resume.approved",
          jobId,
          finalResumePath: resumePath,
          finalScore: lastScore,
          totalIterations: iteration,
          approvedAt: now(),
        };
        (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(approvedEvent);
        logs.push(`Resume orchestrator: Approved at iteration ${iteration} (score ${lastScore})`);
        return { approved: true, finalScore: lastScore, finalResumePath: resumePath, totalIterations: iteration, logs };
      }

      logs.push(
        `Resume orchestrator: Score ${lastScore} below threshold ${passThreshold}, ` +
        (iteration < maxIterations ? "iterating" : "max iterations reached")
      );
    }

    // All iterations exhausted without passing
    const failedEvent: ResumeFailedEvent = {
      type: "resume.failed",
      jobId,
      reason: `Max iterations (${maxIterations}) exceeded. Last score: ${lastScore}`,
      lastScore,
      failedAt: now(),
    };
    (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(failedEvent);
    logs.push(`Resume orchestrator: Failed after ${maxIterations} iterations`);

    return {
      approved: false,
      finalScore: lastScore,
      finalResumePath: resumePath,
      totalIterations: maxIterations,
      logs,
    };
  }
}
