import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";

const SYSTEM_PROMPT = [
  "You are the TesterAgent in a multi-agent development system.",
  "Given code from the BuilderAgent, generate test cases.",
  "Output a JSON object with:",
  '  "tests": array of { "name": string, "file": string, "type": "unit" | "integration", "code": string }',
  '  "coverage": { "estimated": number, "notes": string }',
  '  "summary": one-line summary of test coverage',
].join("\n");

export class TesterAgent implements Agent {
  id = "tester";
  name = "TesterAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const code = input.context.build ?? input.context.code ?? input.context;

    const prompt = `${SYSTEM_PROMPT}\n\nCode to test:\n${JSON.stringify(code, null, 2)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, testPlan: null } };
    }

    try {
      const result = await this.backend.execute(
        { id: input.taskId, context: input.context },
        { taskId: input.taskId, context: { ...input.context, prompt } },
      );

      const testPlan = this.parseResponse(result.data?.response ?? result.data);
      logs.push(...result.logs);
      logs.push(`Tests generated: ${testPlan.summary ?? "complete"}`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Tests: ${testPlan.summary ?? "generated"}`,
        level: "info",
      });

      return { success: true, logs, data: { prompt, testPlan } };
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
        return { summary: raw, tests: [], coverage: { estimated: 0, notes: "unknown" } };
      }
    }
    if (raw && typeof raw === "object") {
      return raw as Record<string, unknown>;
    }
    return { summary: "No response", tests: [], coverage: { estimated: 0, notes: "unknown" } };
  }
}
