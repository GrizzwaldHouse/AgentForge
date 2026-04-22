import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { parseResponse, extractBackendResponse } from "@/lib/response-parser";
import {
  type LearningOutput,
  LEARNING_DEFAULTS,
  LEARNING_REQUIRED,
} from "@/agents/schemas";

const SYSTEM_PROMPT = [
  "You are the LearningAgent in a multi-agent development system.",
  "You observe all outputs from other agents and extract reusable patterns.",
  "You MUST respond with ONLY a valid JSON object (no markdown, no explanation).",
  "Schema:",
  '{',
  '  "patterns": [{ "pattern": string, "source": string, "confidence": number (0-1) }],',
  '  "antiPatterns": [{ "pattern": string, "reason": string }],',
  '  "recommendations": ["string", ...],',
  '  "summary": "one-line summary of learnings"',
  '}',
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

      const learnings = parseResponse<LearningOutput>(
        extractBackendResponse(result.data),
        LEARNING_REQUIRED,
        LEARNING_DEFAULTS,
      );

      logs.push(...result.logs);
      logs.push(
        `Learnings extracted: ${learnings.summary} (${learnings.patterns.length} patterns, ${learnings.antiPatterns.length} anti-patterns)`,
      );

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Learnings: ${learnings.summary}`,
        level: "info",
        humanMessage: `Patterns extracted: ${learnings.summary}`,
      });

      return { success: true, logs, data: { prompt, learnings } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Execution failed: ${message}`);
      return { success: false, logs, data: { prompt, error: message } };
    }
  }
}
