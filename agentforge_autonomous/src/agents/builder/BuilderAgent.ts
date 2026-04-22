import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { parseResponse, extractBackendResponse } from "@/lib/response-parser";
import {
  type BuilderOutput,
  BUILDER_DEFAULTS,
  BUILDER_REQUIRED,
} from "@/agents/schemas";

const SYSTEM_PROMPT = [
  "You are the BuilderAgent in a multi-agent development system.",
  "Given an implementation plan, produce the code changes.",
  "You MUST respond with ONLY a valid JSON object (no markdown, no explanation).",
  "Schema:",
  '{',
  '  "files": [{ "path": string, "content": string, "action": "create" | "modify" }],',
  '  "summary": "one-line summary of what was built"',
  '}',
].join("\n");

export class BuilderAgent implements Agent {
  id = "builder";
  name = "BuilderAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const plan = input.context.plan ?? input.context;

    const prompt = `${SYSTEM_PROMPT}\n\nPlan:\n${JSON.stringify(plan, null, 2)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Analyzing plan and preparing code generation...",
      stepName: "Building",
    });

    if (!this.backend) {
      logs.push("No backend configured — returning stub output");
      return { success: true, logs, data: { build: null } };
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
        humanMessage: "Processing build output...",
        stepName: "Building",
      });

      const build = parseResponse<BuilderOutput>(
        extractBackendResponse(result.data),
        BUILDER_REQUIRED,
        BUILDER_DEFAULTS,
      );

      logs.push(...result.logs);
      logs.push(`Build output: ${build.summary} (${build.files.length} files)`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Built: ${build.summary}`,
        level: "info",
        humanMessage: `Code generated: ${build.summary}`,
      });

      return { success: true, logs, data: { prompt, build } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Execution failed: ${message}`);
      return { success: false, logs, data: { prompt, error: message } };
    }
  }
}
