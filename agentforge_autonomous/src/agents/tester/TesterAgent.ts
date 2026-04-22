import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { parseResponse, extractBackendResponse } from "@/lib/response-parser";
import {
  type TesterOutput,
  TESTER_DEFAULTS,
  TESTER_REQUIRED,
} from "@/agents/schemas";

const SYSTEM_PROMPT = [
  "You are the TesterAgent in a multi-agent development system.",
  "Given code from the BuilderAgent, generate test cases.",
  "You MUST respond with ONLY a valid JSON object (no markdown, no explanation).",
  "Schema:",
  '{',
  '  "tests": [{ "name": string, "file": string, "type": "unit" | "integration", "code": string }],',
  '  "coverage": { "estimated": number (0-100), "notes": string },',
  '  "summary": "one-line summary of test coverage"',
  '}',
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

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Analyzing code and generating test cases...",
      stepName: "Testing",
    });

    if (!this.backend) {
      logs.push("No backend configured — returning prompt-only output");
      return { success: true, logs, data: { prompt, testPlan: null } };
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
        humanMessage: "Processing test results...",
        stepName: "Testing",
      });

      const testPlan = parseResponse<TesterOutput>(
        extractBackendResponse(result.data),
        TESTER_REQUIRED,
        TESTER_DEFAULTS,
      );

      logs.push(...result.logs);
      logs.push(
        `Tests generated: ${testPlan.summary} (${testPlan.tests.length} tests, ${testPlan.coverage.estimated}% estimated coverage)`,
      );

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Tests: ${testPlan.summary}`,
        level: "info",
        humanMessage: `Tests generated: ${testPlan.summary}`,
      });

      return { success: true, logs, data: { prompt, testPlan } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Execution failed: ${message}`);
      return { success: false, logs, data: { prompt, error: message } };
    }
  }
}
