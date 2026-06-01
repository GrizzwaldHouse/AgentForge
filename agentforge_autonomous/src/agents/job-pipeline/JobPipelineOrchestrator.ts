import { agentEventBus } from "@/core/events/agent-event-bus";
import { loadConfig } from "../../../apps/job-agent/config/config-loader";
import { JobIngestionAgent } from "./JobIngestionAgent";
import { JobMatchingAgent } from "./JobMatchingAgent";
import { ProposalGenerationAgent } from "./ProposalGenerationAgent";
import { CriticAgent } from "./CriticAgent";
import { ApplicationOutputAgent } from "./ApplicationOutputAgent";
import { ResumePipelineOrchestrator } from "../resume-pipeline/ResumePipelineOrchestrator";
import type {
  JobIngestedEvent,
  JobMatchedEvent,
  ProposalGeneratedEvent,
  ProposalApprovedEvent,
  ProposalRevisionRequestedEvent,
  PipelineEvent,
} from "./pipeline-events";

const PIPELINE_TYPES = new Set([
  "job.ingested",
  "job.matched",
  "proposal.generated",
  "proposal.approved",
  "proposal.revision_requested",
  "application.queued",
  "pipeline.failed",
]);

export interface PipelineStats {
  ingested: number;
  matched: number;
  proposed: number;
  approved: number;
  queued: number;
  failed: number;
  startedAt: string | null;
}

class JobPipelineOrchestrator {
  private a2 = new JobMatchingAgent();
  private a3 = new ProposalGenerationAgent();
  private critic = new CriticAgent();
  private a4 = new ApplicationOutputAgent();
  private resumeOrchestrator = new ResumePipelineOrchestrator();

  private subId: string | null = null;
  private retryCounts = new Map<string, number>();
  private stats: PipelineStats = this.freshStats();
  private running = false;

  private freshStats(): PipelineStats {
    return { ingested: 0, matched: 0, proposed: 0, approved: 0, queued: 0, failed: 0, startedAt: null };
  }

  getStats(): PipelineStats {
    return { ...this.stats };
  }

  isRunning(): boolean {
    return this.running;
  }

  startPipeline(sources?: string[]): void {
    if (this.running) return;
    this.running = true;
    this.stats = this.freshStats();
    this.stats.startedAt = new Date().toISOString();
    this.retryCounts.clear();

    this.subId = agentEventBus.subscribe((rawEvent) => {
      const event = rawEvent as unknown as PipelineEvent;
      if (!PIPELINE_TYPES.has(event.type)) return;
      this.handleEvent(event).catch((err) => {
        console.error("[Orchestrator] Unhandled error in event handler:", err);
      });
    });

    const ingestionSources = sources ?? loadConfig().sources.phase1;

    const a1 = new JobIngestionAgent();
    a1.execute({
      taskId: `ingestion-${Date.now()}`,
      context: { sources: ingestionSources },
    }).catch((err) => {
      console.error("[Orchestrator] A1 execute error:", err);
    });
  }

  stopPipeline(): void {
    if (this.subId) {
      agentEventBus.unsubscribe(this.subId);
      this.subId = null;
    }
    this.running = false;
  }

  private async handleEvent(event: PipelineEvent): Promise<void> {
    const config = loadConfig();

    switch (event.type) {
      case "job.ingested": {
        this.stats.ingested++;
        // Kick off proposal pipeline (A2 onward)
        await this.a2.execute({
          taskId: `match-${event.jobId}`,
          context: { event: event as JobIngestedEvent },
        });
        // Kick off resume pipeline in parallel (A5a -> A5b loop), fire-and-forget
        this.resumeOrchestrator.runForJob({
          jobId: event.jobId,
          jdText: (event as JobIngestedEvent).description,
        }).catch((err) => {
          console.error(`[Orchestrator] Resume pipeline error for ${event.jobId}:`, err);
        });
        break;
      }

      case "job.matched": {
        this.stats.matched++;
        await this.a3.execute({
          taskId: `proposal-${event.jobId}`,
          context: { event: event as JobMatchedEvent, revisionNumber: 0 },
        });
        break;
      }

      case "proposal.generated": {
        this.stats.proposed++;
        await this.critic.execute({
          taskId: `critic-${event.proposalId}`,
          context: { event: event as ProposalGeneratedEvent },
        });
        break;
      }

      case "proposal.revision_requested": {
        const rev = event as ProposalRevisionRequestedEvent;
        const retries = this.retryCounts.get(rev.jobId) ?? 0;

        if (retries >= config.pipeline.maxCriticRetries) {
          break;
        }

        this.retryCounts.set(rev.jobId, retries + 1);

        const matchedEvent: JobMatchedEvent = {
          type: "job.matched",
          jobId: rev.jobId,
          score: 0,
          matchReasons: [],
          matchedAt: new Date().toISOString(),
          jobData: rev.jobData,
        };

        await this.a3.execute({
          taskId: `proposal-retry-${rev.jobId}-${rev.revisionNumber}`,
          context: {
            event: matchedEvent,
            feedback: rev.feedback,
            revisionNumber: rev.revisionNumber,
          },
        });
        break;
      }

      case "proposal.approved": {
        this.stats.approved++;
        await this.a4.execute({
          taskId: `output-${event.proposalId}`,
          context: { event: event as ProposalApprovedEvent },
        });
        break;
      }

      case "application.queued": {
        this.stats.queued++;
        break;
      }

      case "pipeline.failed": {
        this.stats.failed++;
        console.warn(`[Orchestrator] pipeline.failed at stage "${event.stage}": ${event.error}`);
        break;
      }
    }
  }
}

export const jobPipelineOrchestrator = new JobPipelineOrchestrator();
