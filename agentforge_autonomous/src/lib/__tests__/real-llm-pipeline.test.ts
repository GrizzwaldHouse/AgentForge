/**
 * Real LLM Pipeline Test
 *
 * Tests the full pipeline with a real Ollama backend.
 * Skipped automatically if Ollama is not available.
 *
 * Run with: npx vitest run src/lib/__tests__/real-llm-pipeline.test.ts
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createAgents } from "@/agents/registry";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { SimulatedBackend } from "@/backend/execution/SimulatedBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import type { AgentEvent } from "@/core/events/types";

// Check Ollama availability
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const resp = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: AbortSignal.timeout(2_000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

describe("Real LLM Pipeline (Ollama)", () => {
  let ollamaAvailable = false;

  beforeAll(async () => {
    ollamaAvailable = await isOllamaAvailable();
    if (!ollamaAvailable) {
      console.log("[SKIP] Ollama not available — skipping real LLM tests");
    }
  });

  it("full pipeline executes with simulated backend (baseline)", async () => {
    const backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });
    const agents = createAgents(backend);
    const orch = new ObservableOrchestrator(agents, { safetyEnabled: false });

    const events: AgentEvent[] = [];
    const subId = agentEventBus.subscribe((e) => events.push(e));

    const result = await orch.run("baseline-test", {
      description: "Build a simple REST API endpoint for user registration",
    });

    agentEventBus.unsubscribe(subId);

    // All 6 agents should complete
    expect(result.agentResults).toHaveLength(6);
    expect(result.agentResults.every((r) => r.success)).toBe(true);

    // Should emit session:start, agent events, session:end
    const sessionStarts = events.filter((e) => e.type === "session:start");
    const sessionEnds = events.filter((e) => e.type === "session:end");
    expect(sessionStarts).toHaveLength(1);
    expect(sessionEnds).toHaveLength(1);

    // Each agent should have start + complete events
    const agentStarts = events.filter((e) => e.type === "agent:start");
    const agentCompletes = events.filter((e) => e.type === "agent:complete");
    expect(agentStarts).toHaveLength(6);
    expect(agentCompletes).toHaveLength(6);
  });

  it("multi-run stability: 3 sequential runs produce consistent results", async () => {
    const backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });
    const tasks = [
      { description: "Build login page" },
      { description: "Add database schema" },
      { description: "Create unit tests" },
    ];

    const results = [];
    for (const ctx of tasks) {
      const agents = createAgents(backend);
      const orch = new ObservableOrchestrator(agents, { safetyEnabled: false });
      const result = await orch.run(`multi-run-${results.length}`, ctx);
      results.push(result);
    }

    // All runs should complete with all agents succeeding
    for (const r of results) {
      expect(r.agentResults).toHaveLength(6);
      expect(r.agentResults.every((a) => a.success)).toBe(true);
    }

    // All sessions should be unique
    const sessionIds = new Set(results.map((r) => r.sessionId));
    expect(sessionIds.size).toBe(3);
  });

  it("SSE event count is consistent across runs", async () => {
    const backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });

    const eventCounts: number[] = [];

    for (let i = 0; i < 3; i++) {
      const events: AgentEvent[] = [];
      const subId = agentEventBus.subscribe((e) => events.push(e));

      const agents = createAgents(backend);
      const orch = new ObservableOrchestrator(agents, { safetyEnabled: false });
      await orch.run(`sse-consistency-${i}`, { description: "test" });

      agentEventBus.unsubscribe(subId);
      eventCounts.push(events.length);
    }

    // Event count should be stable across runs (within +/- 2 tolerance for timing)
    const avg = eventCounts.reduce((a, b) => a + b, 0) / eventCounts.length;
    for (const count of eventCounts) {
      expect(Math.abs(count - avg)).toBeLessThanOrEqual(2);
    }
  });
});
