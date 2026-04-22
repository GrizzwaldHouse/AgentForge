/**
 * Failure Injection Tests
 *
 * Validates system resilience under:
 * - Malformed JSON from LLM responses
 * - Agent timeouts
 * - Kill switch activation mid-run
 * - Backend unavailability
 * - Concurrent pipeline stability
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend, TaskStatus } from "@/backend/execution/ExecutionBackend";
import type { Task } from "@/core/entities/Task";
import type { AgentEvent } from "@/core/events/types";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { killSwitch } from "@/safety/kill-switch";
import { PlannerAgent } from "@/agents/planner/PlannerAgent";
import { BuilderAgent } from "@/agents/builder/BuilderAgent";
import { ReviewerAgent } from "@/agents/reviewer/ReviewerAgent";
import { parseResponse } from "@/lib/response-parser";
import { PLANNER_DEFAULTS, PLANNER_REQUIRED, type PlannerOutput } from "@/agents/schemas";

// --- Mock Backend that returns configurable responses ---

class ConfigurableBackend implements ExecutionBackend {
  readonly type = "mock" as const;
  constructor(private responseFn: (task: Task, input: AgentInput) => Promise<AgentOutput>) {}
  async execute(task: Task, input: AgentInput): Promise<AgentOutput> {
    return this.responseFn(task, input);
  }
  cancel(): void {}
  status(): TaskStatus { return "completed"; }
}

// --- Helpers ---

function malformedJsonBackend(response: string): ConfigurableBackend {
  return new ConfigurableBackend(async () => ({
    success: true,
    logs: ["[mock] delivered malformed response"],
    data: { response },
  }));
}

function timeoutBackend(delayMs: number): ConfigurableBackend {
  return new ConfigurableBackend(async () => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { success: true, logs: ["[mock] delayed response"], data: { response: "{}" } };
  });
}

function errorBackend(error: Error): ConfigurableBackend {
  return new ConfigurableBackend(async () => { throw error; });
}

// --- Test Suite ---

describe("Failure Injection: Malformed JSON Responses", () => {
  it("handles completely invalid JSON gracefully", () => {
    const result = parseResponse<PlannerOutput>(
      "This is not JSON at all, just random text from a confused LLM",
      PLANNER_REQUIRED,
      PLANNER_DEFAULTS,
    );
    expect(result.steps).toEqual([]);
    expect(result.summary).toBeDefined();
  });

  it("handles truncated JSON (partial response)", () => {
    const result = parseResponse<PlannerOutput>(
      '{"steps": [{"id": 1, "action": "create", "details": "tru',
      PLANNER_REQUIRED,
      PLANNER_DEFAULTS,
    );
    // Should fall back to defaults since JSON is incomplete
    expect(result.steps).toEqual([]);
  });

  it("handles JSON with trailing garbage", () => {
    const result = parseResponse<PlannerOutput>(
      '{"steps": [], "summary": "clean"} and then some random text after',
      PLANNER_REQUIRED,
      PLANNER_DEFAULTS,
    );
    expect(result.summary).toBe("clean");
    expect(result.steps).toEqual([]);
  });

  it("handles markdown-wrapped JSON with extra commentary", () => {
    const input = [
      "Sure! Here is your plan:",
      "",
      "```json",
      '{"steps": [{"id": 1, "action": "test", "details": "d"}], "summary": "fenced", "estimatedFiles": ["a.ts"]}',
      "```",
      "",
      "Let me know if you need anything else!",
    ].join("\n");

    const result = parseResponse<PlannerOutput>(input, PLANNER_REQUIRED, PLANNER_DEFAULTS);
    expect(result.summary).toBe("fenced");
    expect(result.steps).toHaveLength(1);
  });

  it("handles empty string response", () => {
    const result = parseResponse<PlannerOutput>("", PLANNER_REQUIRED, PLANNER_DEFAULTS);
    expect(result.steps).toEqual([]);
    expect(result.summary).toBe("No plan generated");
  });

  it("handles response with only whitespace", () => {
    const result = parseResponse<PlannerOutput>("   \n\n  ", PLANNER_REQUIRED, PLANNER_DEFAULTS);
    expect(result.steps).toEqual([]);
  });

  it("PlannerAgent returns success even with malformed backend response", async () => {
    const backend = malformedJsonBackend("totally not json {{{{");
    const agent = new PlannerAgent(backend);
    const result = await agent.execute({ taskId: "malformed-1", context: { description: "test" } });

    expect(result.success).toBe(true);
    expect(result.data.plan).toBeDefined();
    expect(result.data.plan.steps).toEqual([]);
  });

  it("BuilderAgent returns success with malformed response", async () => {
    const backend = malformedJsonBackend("I can't produce JSON right now");
    const agent = new BuilderAgent(backend);
    const result = await agent.execute({ taskId: "malformed-2", context: { plan: {} } });

    expect(result.success).toBe(true);
    expect(result.data.build.files).toEqual([]);
  });

  it("ReviewerAgent returns success with malformed response", async () => {
    const backend = malformedJsonBackend("ERROR: model overloaded");
    const agent = new ReviewerAgent(backend);
    const result = await agent.execute({ taskId: "malformed-3", context: { code: "x" } });

    expect(result.success).toBe(true);
    expect(result.data.review.issues).toEqual([]);
    // Defaults to approved when parsing fails
    expect(result.data.review.approved).toBe(true);
  });
});

describe("Failure Injection: Agent Timeouts", () => {
  it("slow agent does not block other agents in parallel mode", async () => {
    const fastAgent: Agent = {
      id: "fast",
      name: "FastAgent",
      execute: async () => ({ success: true, logs: ["fast done"], data: {} }),
    };
    const slowAgent: Agent = {
      id: "slow",
      name: "SlowAgent",
      execute: async () => {
        await new Promise((r) => setTimeout(r, 200));
        return { success: true, logs: ["slow done"], data: {} };
      },
    };

    const orch = new ObservableOrchestrator([fastAgent, slowAgent], {
      parallel: true,
      safetyEnabled: false,
    });
    const result = await orch.run("timeout-test", {});

    expect(result.agentResults).toHaveLength(2);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
    // Fast agent should complete before slow
    expect(result.agentResults[0].durationMs).toBeLessThan(result.agentResults[1].durationMs);
  });

  it("agent that throws after delay is captured as failure", async () => {
    const delayedFailAgent: Agent = {
      id: "delayed-fail",
      name: "DelayedFailAgent",
      execute: async () => {
        await new Promise((r) => setTimeout(r, 50));
        throw new Error("delayed explosion");
      },
    };

    const orch = new ObservableOrchestrator([delayedFailAgent], { safetyEnabled: false });
    const result = await orch.run("delayed-fail-test", {});

    expect(result.agentResults[0].success).toBe(false);
    expect(result.agentResults[0].durationMs).toBeGreaterThanOrEqual(40);
  });
});

describe("Failure Injection: Kill Switch Mid-Run", () => {
  let events: AgentEvent[];
  let subId: string;

  beforeEach(() => {
    events = [];
    subId = agentEventBus.subscribe((e) => events.push(e));
    if (killSwitch.isActive()) killSwitch.deactivate();
  });

  afterEach(() => {
    agentEventBus.unsubscribe(subId);
    if (killSwitch.isActive()) killSwitch.deactivate();
  });

  it("kill switch blocks ALL agents when active before run", async () => {
    killSwitch.activate("emergency stop");

    const agents: Agent[] = [
      { id: "a1", name: "A1", execute: async () => ({ success: true, logs: ["ok"], data: {} }) },
      { id: "a2", name: "A2", execute: async () => ({ success: true, logs: ["ok"], data: {} }) },
    ];

    const orch = new ObservableOrchestrator(agents, { safetyEnabled: true });
    const result = await orch.run("killswitch-test", {});

    expect(result.agentResults.every((r) => !r.success)).toBe(true);

    const errorEvents = events.filter((e) => e.type === "agent:error");
    expect(errorEvents.length).toBe(2);
    for (const e of errorEvents) {
      const err = e as Extract<AgentEvent, { type: "agent:error" }>;
      expect(err.error).toContain("kill switch");
    }
  });

  it("pipeline completes normally after kill switch is deactivated", async () => {
    killSwitch.activate();
    killSwitch.deactivate();

    const agents: Agent[] = [
      { id: "ok1", name: "OK1", execute: async () => ({ success: true, logs: ["fine"], data: {} }) },
    ];

    const orch = new ObservableOrchestrator(agents, { safetyEnabled: true });
    const result = await orch.run("after-killswitch", {});

    expect(result.agentResults[0].success).toBe(true);
  });
});

describe("Failure Injection: Backend Errors", () => {
  it("agent catches backend error and returns failure", async () => {
    const backend = errorBackend(new Error("Ollama is not reachable"));
    const agent = new PlannerAgent(backend);
    const result = await agent.execute({ taskId: "backend-err", context: { description: "test" } });

    expect(result.success).toBe(false);
    expect(result.data.error).toContain("Ollama is not reachable");
    expect(result.logs.some((l: string) => l.includes("Execution failed"))).toBe(true);
  });
});

describe("Failure Injection: Load Stability", () => {
  it("5 sequential pipeline runs produce independent sessions", async () => {
    const agent: Agent = {
      id: "load-agent",
      name: "LoadAgent",
      execute: async (input) => ({
        success: true,
        logs: [`run ${input.taskId}`],
        data: { taskId: input.taskId },
      }),
    };

    const sessionIds = new Set<string>();

    for (let i = 0; i < 5; i++) {
      const orch = new ObservableOrchestrator([agent], { safetyEnabled: false });
      const result = await orch.run(`load-${i}`, { iteration: i });
      sessionIds.add(result.sessionId);
      expect(result.agentResults[0].success).toBe(true);
    }

    // All sessions should have unique IDs
    expect(sessionIds.size).toBe(5);
  });

  it("5 parallel pipeline runs all complete successfully", async () => {
    const createAgent = (id: string): Agent => ({
      id,
      name: `${id}Agent`,
      execute: async () => {
        await new Promise((r) => setTimeout(r, Math.random() * 50));
        return { success: true, logs: [`${id} done`], data: {} };
      },
    });

    const promises = Array.from({ length: 5 }, (_, i) => {
      const orch = new ObservableOrchestrator(
        [createAgent(`par-${i}`)],
        { safetyEnabled: false },
      );
      return orch.run(`parallel-load-${i}`, {});
    });

    const results = await Promise.all(promises);
    expect(results).toHaveLength(5);
    for (const r of results) {
      expect(r.agentResults[0].success).toBe(true);
    }

    // All sessions unique
    const ids = new Set(results.map((r) => r.sessionId));
    expect(ids.size).toBe(5);
  });
});
