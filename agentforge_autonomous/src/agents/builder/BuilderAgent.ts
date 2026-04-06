import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";

const SYSTEM_PROMPT = [
  "You are the BuilderAgent in a multi-agent development system.",
  "Given an implementation plan, produce the code changes.",
  "Output a JSON object with:",
  '  "files": array of { "path": string, "content": string, "action": "create" | "modify" }',
  '  "summary": one-line summary of what was built',
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

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, build: null } };
    }

    try {
      const result = await this.backend.execute(
        { id: input.taskId, context: input.context },
        { taskId: input.taskId, context: { ...input.context, prompt } },
      );

      const build = this.parseResponse(result.data?.response ?? result.data);
      logs.push(...result.logs);
      logs.push(`Build output: ${build.summary ?? "complete"}`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Built: ${build.summary ?? "code generated"}`,
        level: "info",
      });

      return { success: true, logs, data: { prompt, build } };
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
        return { summary: raw, files: [] };
      }
    }
    if (raw && typeof raw === "object") {
      return raw as Record<string, unknown>;
    }
    return { summary: "No response", files: [] };
  }
}
