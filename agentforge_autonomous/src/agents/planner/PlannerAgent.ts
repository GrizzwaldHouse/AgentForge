import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { parseResponse, extractBackendResponse } from "@/lib/response-parser";
import {
  type PlannerOutput,
  PLANNER_DEFAULTS,
  PLANNER_REQUIRED,
} from "@/agents/schemas";

const SYSTEM_PROMPT = [
  "You are the PlannerAgent in a multi-agent development system.",
  "Given a task description, produce a step-by-step implementation plan.",
  "You MUST respond with ONLY a valid JSON object (no markdown, no explanation).",
  "Schema:",
  '{',
  '  "steps": [{ "id": number, "action": string, "details": string }],',
  '  "summary": "one-line summary of the plan",',
  '  "estimatedFiles": ["path/to/file.ts", ...]',
  '}',
].join("\n");

export class PlannerAgent implements Agent {
  id = "planner";
  name = "PlannerAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const taskDescription =
      input.context.description ?? input.context.task ?? JSON.stringify(input.context);

    const prompt = `${SYSTEM_PROMPT}\n\nTask: ${taskDescription}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Analyzing task and constructing plan...",
      stepName: "Planning",
    });

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, plan: null } };
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
        humanMessage: "Processing plan response...",
        stepName: "Planning",
      });

      const plan = parseResponse<PlannerOutput>(
        extractBackendResponse(result.data),
        PLANNER_REQUIRED,
        PLANNER_DEFAULTS,
      );

      logs.push(...result.logs);
      logs.push(`Plan generated: ${plan.summary} (${plan.steps.length} steps, ${plan.estimatedFiles.length} files)`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Plan: ${plan.summary}`,
        level: "info",
        humanMessage: `Plan generated: ${plan.summary}`,
      });

      return { success: true, logs, data: { prompt, plan } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Execution failed: ${message}`);
      return { success: false, logs, data: { prompt, error: message } };
    }
  }
}
