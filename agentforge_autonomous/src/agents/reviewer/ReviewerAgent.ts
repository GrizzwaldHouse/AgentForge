import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";

const SYSTEM_PROMPT = [
  "You are the ReviewerAgent in a multi-agent development system.",
  "Given code output from the BuilderAgent, review it for quality issues.",
  "Output a JSON object with:",
  '  "issues": array of { "severity": "critical" | "warning" | "info", "file": string, "line": number, "message": string }',
  '  "approved": boolean',
  '  "summary": one-line review summary',
].join("\n");

export class ReviewerAgent implements Agent {
  id = "reviewer";
  name = "ReviewerAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const code = input.context.build ?? input.context.code ?? input.context;

    const prompt = `${SYSTEM_PROMPT}\n\nCode to review:\n${JSON.stringify(code, null, 2)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Analyzing code for quality issues...",
      stepName: "Reviewing",
    });

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, review: null } };
    }

    try {
      const result = await this.backend.execute(
        { id: input.taskId, context: input.context },
        { taskId: input.taskId, context: { ...input.context, prompt } },
      );

      emitProgress({
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        progress: 70,
        humanMessage: "Processing review results...",
        stepName: "Reviewing",
      });

      const review = this.parseResponse(result.data?.response ?? result.data);
      logs.push(...result.logs);
      logs.push(`Review: ${review.approved ? "APPROVED" : "CHANGES REQUESTED"} — ${review.summary ?? ""}`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Review: ${review.approved ? "approved" : "changes requested"}`,
        level: review.approved ? "info" : "warn",
        humanMessage: `Code review: ${review.approved ? "approved" : "changes requested"} \u2014 ${review.summary ?? ""}`,
      });

      return { success: true, logs, data: { prompt, review } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Execution failed: ${message}`);
      return { success: false, logs, data: { prompt, error: message } };
    }
  }

  private parseResponse(raw: unknown): Record<string, unknown> {
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return { summary: raw, issues: [], approved: true };
      }
    }
    if (raw && typeof raw === "object") {
      return raw as Record<string, unknown>;
    }
    return { summary: "No response", issues: [], approved: true };
  }
}
