import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";

const SYSTEM_PROMPT = [
  "You are the LearningAgent in a multi-agent development system.",
  "You observe all outputs from other agents and extract reusable patterns.",
  "Given the combined outputs of a pipeline run, produce:",
  '  "patterns": array of { "pattern": string, "source": string, "confidence": number }',
  '  "antiPatterns": array of { "pattern": string, "reason": string }',
  '  "recommendations": array of strings for improving future runs',
  '  "summary": one-line summary of learnings',
].join("\n");

export class LearningAgent implements Agent {
  id = "learning";
  name = "LearningAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];

    const prompt = `${SYSTEM_PROMPT}\n\nPipeline outputs:\n${JSON.stringify(input.context, null, 2)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Analyzing pipeline outputs for patterns...",
      stepName: "Learning",
    });

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, learnings: null } };
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
        humanMessage: "Processing extracted patterns...",
        stepName: "Learning",
      });

      const learnings = this.parseResponse(result.data?.response ?? result.data);
      logs.push(...result.logs);
      logs.push(`Learnings extracted: ${learnings.summary ?? "complete"}`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Learnings: ${learnings.summary ?? "extracted"}`,
        level: "info",
        humanMessage: `Patterns extracted: ${learnings.summary ?? "learning complete"}`,
      });

      return { success: true, logs, data: { prompt, learnings } };
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
        return { summary: raw, patterns: [], antiPatterns: [], recommendations: [] };
      }
    }
    if (raw && typeof raw === "object") {
      return raw as Record<string, unknown>;
    }
    return { summary: "No response", patterns: [], antiPatterns: [], recommendations: [] };
  }
}
