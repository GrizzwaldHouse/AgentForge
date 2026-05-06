/**
 * Self-Healing Orchestration Tests
 *
 * Covers:
 * - ModelRouter routing correctness
 * - SelfHealingEngine failure analysis
 * - AutoDebugLoop convergence
 * - SupervisorOrchestrator end-to-end
 * - Failure injection scenarios
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ModelRouter } from "@/routing/ModelRouter";
import { SelfHealingEngine } from "@/healing/SelfHealingEngine";
import { AutoDebugLoop, validateSchema, classifyError } from "@/healing/AutoDebugLoop";
import { SupervisorOrchestrator } from "@/orchestrator/SupervisorOrchestrator";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { killSwitch } from "@/safety/kill-switch";
import { resetEnvCache } from "@/config/env";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { AgentEvent } from "@/core/events/types";

// --- Helpers ---

function mockAgent(id: string, behavior: "success" | "fail" | "invalid-json" = "success"): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (): Promise<AgentOutput> => {
      if (behavior === "fail") throw new Error("Agent crashed");
      if (behavior === "invalid-json") {
        return {
          success: false,
          logs: ["invalid json"],
          data: { response: "This is not JSON", error: "parse failed" },
        };
      }
      return { success: true, logs: [`${id} ok`], data: { result: "done" } };
    },
  };
}

function flakyAgent(id: string, failCount: number): Agent {
  let calls = 0;
  return {
    id,
    name: `${id}Agent`,
    execute: async (): Promise<AgentOutput> => {
      calls++;
      if (calls <= failCount) {
        throw new Error(`Transient failure #${calls}`);
      }
      return { success: true, logs: [`${id} recovered on attempt ${calls}`], data: {} };
    },
  };
}

// --- ModelRouter Tests ---

describe("ModelRouter", () => {
  beforeEach(() => resetEnvCache());
  afterEach(() => resetEnvCache());

  it("selects ollama as primary for local-preferred config", () => {
    const router = new ModelRouter({ preferLocal: true });
    const decision = router.selectModel({
      domain: "code-generation",
      complexity: "simple",
      estimatedTokens: 500,
      requiresStructuredOutput: true,
    });

    expect(decision.provider).toBe("ollama");
    expect(decision.model).toBeDefined();
    expect(decision.fallbacks.length).toBeGreaterThanOrEqual(0);
  });

  it("classifies tasks correctly per agent ID", () => {
    const router = new ModelRouter();

    expect(router.classifyTask("planner", {}).domain).toBe("planning");
    expect(router.classifyTask("builder", {}).domain).toBe("code-generation");
    expect(router.classifyTask("reviewer", {}).domain).toBe("code-review");
    expect(router.classifyTask("tester", {}).domain).toBe("testing");
    expect(router.classifyTask("learning", {}).domain).toBe("learning");
    expect(router.classifyTask("context", {}).domain).toBe("general");
    expect(router.classifyTask("unknown", {}).domain).toBe("general");
  });

  it("classifies complexity based on context size", () => {
    const router = new ModelRouter();

    const small = router.classifyTask("planner", { description: "simple" });
    expect(small.complexity).toBe("simple");

    const large = router.classifyTask("planner", { data: "x".repeat(6000) });
    expect(large.complexity).toBe("complex");
  });

  it("provides fallback after failure", () => {
    const router = new ModelRouter();
    const task = {
      domain: "code-generation" as const,
      complexity: "simple" as const,
      estimatedTokens: 500,
      requiresStructuredOutput: true,
    };

    const primary = router.selectModel(task);
    const fallback = router.fallback(primary.provider, task);

    // Should get a different provider
    if (fallback) {
      expect(fallback.provider).not.toBe(primary.provider);
    }
  });

  it("tracks health across success and failure", () => {
    const router = new ModelRouter();

    router.recordSuccess("ollama", 150);
    router.recordFailure("groq");
    router.recordFailure("groq");
    router.recordFailure("groq"); // 3 failures = unhealthy

    const health = router.getHealthStatus();
    const ollama = health.find((h) => h.name === "ollama");
    const groq = health.find((h) => h.name === "groq");

    expect(ollama?.healthy).toBe(true);
    expect(ollama?.latencyMs).toBe(150);
    expect(groq?.consecutiveFailures).toBe(3);
    // groq may or may not have API key in test env
  });
});

// --- SelfHealingEngine Tests ---

describe("SelfHealingEngine", () => {
  const healer = new SelfHealingEngine({ maxRetries: 3, retryDelayMs: 0 });

  it("categorizes timeout errors", () => {
    const analysis = healer.analyzeFailure(new Error("Request timed out after 60000ms"));
    expect(analysis.category).toBe("timeout");
    expect(analysis.recoverable).toBe(true);
    expect(analysis.suggestedStrategy).toBe("retry_same_model");
  });

  it("categorizes rate limit errors", () => {
    const analysis = healer.analyzeFailure(new Error("429 Too Many Requests"));
    expect(analysis.category).toBe("rate_limit");
    expect(analysis.suggestedStrategy).toBe("switch_model");
  });

  it("categorizes provider errors", () => {
    const analysis = healer.analyzeFailure(new Error("Ollama is not reachable"));
    expect(analysis.category).toBe("provider_error");
    expect(analysis.suggestedStrategy).toBe("switch_model");
  });

  it("categorizes invalid JSON in raw output", () => {
    const analysis = healer.analyzeFailure(new Error("validation"), "Not valid JSON output");
    expect(analysis.category).toBe("invalid_json");
    expect(analysis.suggestedStrategy).toBe("prompt_repair");
  });

  it("categorizes unknown errors as retryable", () => {
    const analysis = healer.analyzeFailure(new Error("Some bizarre error nobody expected"));
    expect(analysis.category).toBe("unknown");
    expect(analysis.recoverable).toBe(true);
    expect(analysis.suggestedStrategy).toBe("retry_same_model");
  });

  it("repairs prompt with stricter JSON instructions", () => {
    const analysis = healer.analyzeFailure(new Error("parse"), "bad json");
    const repaired = healer.repairPrompt("Original prompt here", analysis);

    expect(repaired).toContain("CRITICAL");
    expect(repaired).toContain("ONLY a JSON object");
    expect(repaired).toContain("Original prompt here");
  });

  it("healing loop converges on valid output", async () => {
    let calls = 0;
    const executeFn = async () => {
      calls++;
      if (calls === 1) return { output: null, raw: "not json" };
      return { output: { summary: "fixed" }, raw: '{"summary": "fixed"}' };
    };

    const result = await healer.executeHealingLoop(
      executeFn,
      "test prompt",
      (output) => output !== null && typeof output === "object",
    );

    expect(result.recovered).toBe(true);
    expect(result.totalAttempts).toBe(2);
  });

  it("healing loop gives up after max retries", async () => {
    const executeFn = async () => ({ output: null, raw: "always bad" });

    const result = await healer.executeHealingLoop(
      executeFn,
      "test prompt",
      (output) => output !== null,
    );

    expect(result.recovered).toBe(false);
    expect(result.totalAttempts).toBe(3);
  });
});

// --- AutoDebugLoop Tests ---

describe("AutoDebugLoop", () => {
  const loop = new AutoDebugLoop({ maxRetries: 2, retryDelayMs: 0 });

  it("validates schema correctly", () => {
    const errors = validateSchema(
      { name: "test", count: 5 },
      [
        { name: "name", type: "string", required: true },
        { name: "count", type: "number", required: true },
      ],
    );
    expect(errors).toEqual([]);
  });

  it("detects missing required fields", () => {
    const errors = validateSchema(
      { name: "test" },
      [
        { name: "name", type: "string", required: true },
        { name: "missing", type: "number", required: true },
      ],
    );
    expect(errors).toContain("Missing required field: missing");
  });

  it("detects type mismatches", () => {
    const errors = validateSchema(
      { count: "not a number" },
      [{ name: "count", type: "number", required: true }],
    );
    expect(errors).toEqual(expect.arrayContaining([expect.stringContaining("expected number")]));
  });

  it("classifies JSON parse errors", () => {
    const result = classifyError(new Error("Unexpected token in JSON"));
    expect(result.category).toBe("json_parse_error");
    expect(result.actionable).toBe(true);
  });

  it("classifies timeout errors", () => {
    const result = classifyError(new Error("Request timeout after 60s"));
    expect(result.category).toBe("timeout");
    expect(result.actionable).toBe(true);
  });

  it("auto-debug loop succeeds on first try with valid output", async () => {
    const result = await loop.run(
      async () => '{"summary": "done", "steps": []}',
      "test prompt",
      [
        { name: "summary", type: "string", required: true },
        { name: "steps", type: "array", required: true },
      ],
      "test-agent",
      "test-task",
    );

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("auto-debug loop retries and converges", async () => {
    let calls = 0;
    const result = await loop.run(
      async () => {
        calls++;
        if (calls === 1) return "not json at all";
        return '{"summary": "recovered", "steps": []}';
      },
      "test prompt",
      [
        { name: "summary", type: "string", required: true },
        { name: "steps", type: "array", required: true },
      ],
      "retry-agent",
      "retry-task",
    );

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
  });

  it("auto-debug loop fails after exhausting retries", async () => {
    const result = await loop.run(
      async () => "always bad output",
      "test prompt",
      [{ name: "required", type: "string", required: true }],
      "fail-agent",
      "fail-task",
    );

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(2); // maxRetries counts total attempts in AutoDebugLoop
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// --- SupervisorOrchestrator Tests ---

describe("SupervisorOrchestrator", () => {
  let events: AgentEvent[];
  let subId: string;

  beforeEach(() => {
    resetEnvCache();
    events = [];
    subId = agentEventBus.subscribe((e) => events.push(e));
    if (killSwitch.isActive()) killSwitch.deactivate();
  });

  afterEach(() => {
    agentEventBus.unsubscribe(subId);
    resetEnvCache();
    if (killSwitch.isActive()) killSwitch.deactivate();
  });

  it("executes all agents successfully", async () => {
    const agents = [mockAgent("a1"), mockAgent("a2"), mockAgent("a3")];
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: false });

    const result = await supervisor.run("sup-test-1", { description: "test" });

    expect(result.agentResults).toHaveLength(3);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
    expect(result.healingSummary.totalRetries).toBe(0);
  });

  it("recovers from transient failure via self-healing", async () => {
    // Agent fails once then succeeds
    const agents = [flakyAgent("flaky", 1), mockAgent("stable")];
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: false });

    const result = await supervisor.run("sup-heal-1", { description: "test" });

    // Flaky agent should recover
    expect(result.agentResults[0].success).toBe(true);
    expect(result.agentResults[0].healingAttempts).toBe(1);
    expect(result.agentResults[1].success).toBe(true);
    expect(result.healingSummary.recoveredFailures).toBe(1);
  });

  it("reports unrecoverable failure when agent always fails", async () => {
    // Agent fails on every attempt
    const agents = [flakyAgent("always-fail", 100)]; // will never succeed within 3 retries
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: false });

    const result = await supervisor.run("sup-fail-1", { description: "test" });

    expect(result.agentResults[0].success).toBe(false);
    expect(result.agentResults[0].healingAttempts).toBeGreaterThan(0);
    expect(result.healingSummary.unrecoverableFailures).toBe(1);
  });

  it("respects kill switch", async () => {
    killSwitch.activate("test emergency");

    const agents = [mockAgent("blocked")];
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: true });

    const result = await supervisor.run("sup-kill-1", { description: "test" });

    expect(result.agentResults[0].success).toBe(false);
    const errorEvents = events.filter((e) => e.type === "agent:error");
    expect(errorEvents.length).toBeGreaterThan(0);
  });

  it("tracks provider in results", async () => {
    const agents = [mockAgent("tracked")];
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: false });

    const result = await supervisor.run("sup-track-1", { description: "test" });

    expect(result.agentResults[0].provider).toBeDefined();
  });

  it("emits session:start and session:end events", async () => {
    const agents = [mockAgent("event-test")];
    const supervisor = new SupervisorOrchestrator(agents, { safetyEnabled: false });

    await supervisor.run("sup-events-1", { description: "test" });

    const starts = events.filter((e) => e.type === "session:start");
    const ends = events.filter((e) => e.type === "session:end");
    expect(starts).toHaveLength(1);
    expect(ends).toHaveLength(1);
  });

  it("parallel mode executes all agents", async () => {
    const agents = [mockAgent("p1"), mockAgent("p2"), mockAgent("p3")];
    const supervisor = new SupervisorOrchestrator(agents, {
      parallel: true,
      safetyEnabled: false,
    });

    const result = await supervisor.run("sup-parallel-1", { description: "test" });

    expect(result.agentResults).toHaveLength(3);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
  });

  it("throws on empty agents array", () => {
    expect(() => new SupervisorOrchestrator([])).toThrow("requires at least one agent");
  });

  it("throws on invalid taskId", async () => {
    const supervisor = new SupervisorOrchestrator([mockAgent("x")]);
    await expect(supervisor.run("", {})).rejects.toThrow("non-empty string");
  });

  it("returns health status", () => {
    const supervisor = new SupervisorOrchestrator([mockAgent("h")]);
    const health = supervisor.getProviderHealth();
    expect(Array.isArray(health)).toBe(true);
    expect(health.length).toBeGreaterThan(0);
    expect(health[0]).toHaveProperty("name");
    expect(health[0]).toHaveProperty("healthy");
  });
});
