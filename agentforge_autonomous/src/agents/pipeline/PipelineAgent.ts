import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import { runPipelineCommand, type PipelineCommand } from "@/lib/pipeline-runner";

const VALID_COMMANDS: PipelineCommand[] = [
  "validate",
  "build",
  "sync",
  "full",
  "status",
  "dashboard-state",
];

/**
 * PipelineAgent — wraps the WizardJam pipeline.py as an AgentForge agent.
 * Triggered via /api/agent/run with context.command set to a pipeline command.
 *
 * Example:
 *   POST /api/agent/run
 *   { "taskId": "validate-booklet", "context": { "command": "validate" } }
 */
export class PipelineAgent implements Agent {
  id = "pipeline-agent";
  name = "Pipeline Agent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;
    const command = context.command;

    if (typeof command !== "string" || !VALID_COMMANDS.includes(command as PipelineCommand)) {
      return {
        success: false,
        logs: [`Invalid or missing context.command. Expected one of: ${VALID_COMMANDS.join(", ")}`],
      };
    }

    // Prompt-only mode: if PIPELINE_PATH is not configured, return success with a
    // warning rather than failing — consistent with other agents that degrade gracefully
    // when their external dependency (backend / pipeline script) is absent.
    if (!process.env.PIPELINE_PATH) {
      return {
        success: true,
        data: { exitCode: null, durationMs: 0, output: null },
        logs: [
          `Pipeline command: ${command}`,
          "No PIPELINE_PATH configured — returning prompt-only output",
        ],
      };
    }

    const extraArgs: string[] = [];
    if ((command === "sync" || command === "full") && typeof context.message === "string") {
      extraArgs.push("-m", context.message);
    }

    const result = await runPipelineCommand(command as PipelineCommand, extraArgs);

    return {
      success: result.success,
      data: {
        exitCode: result.exitCode,
        durationMs: result.durationMs,
        output: result.output,
      },
      logs: [
        `Pipeline command: ${command}`,
        `Exit code: ${result.exitCode}`,
        `Duration: ${result.durationMs}ms`,
        ...result.output.split("\n").filter(Boolean),
      ],
    };
  }
}
