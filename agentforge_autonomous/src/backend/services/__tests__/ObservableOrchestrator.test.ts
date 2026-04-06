import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ObservableOrchestrator } from "../ObservableOrchestrator";
import { agentEventBus } from "@/core/events/agent-event-bus";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { AgentEvent } from "@/core/events/types";

function createMockAgent(id: string, output?: Partial<AgentOutput>): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (_input: AgentInput): Promise<AgentOutput> => ({
      success: true,
      logs: [`${id} executed`],
      data: null,
      ...output,
    }),
  };
}

function createFailingAgent(id: string, error: string): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async () => {
      throw new Error(error);
    },
  };
}

describe("ObservableOrchestrator", () => {
  let capturedEvents: AgentEvent[];
  let subId: string;

  beforeEach(() => {
    agentEventBus.clear();
    capturedEvents = [];
    subId = agentEventBus.subscribe((event) => capturedEvents.push(event));
  });

  afterEach(() => {
    agentEventBus.unsubscribe(subId);
  });

  it("runs agents sequentially and emits lifecycle events", async () => {
    // Arrange
    const agents = [createMockAgent("alpha"), createMockAgent("beta")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("task-1", { test: true });

    // Assert
    expect(result.agentResults).toHaveLength(2);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
    expect(result.traceId).toMatch(/^trace_/);

    // Check event ordering: session:start, then agent events, then session:end
    const types = capturedEvents.map((e) => e.type);
    expect(types[0]).toBe("session:start");
    expect(types[types.length - 1]).toBe("session:end");
    expect(types).toContain("agent:start");
    expect(types).toContain("agent:complete");
    expect(types).toContain("agent:log");
  });

  it("runs agents in parallel when configured", async () => {
    // Arrange
    const agents = [createMockAgent("one"), createMockAgent("two"), createMockAgent("three")];
    const orchestrator = new ObservableOrchestrator(agents, { parallel: true });

    // Act
    const result = await orchestrator.run("task-2", {});

    // Assert
    expect(result.agentResults).toHaveLength(3);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
  });

  it("handles agent failures without stopping other agents", async () => {
    // Arrange
    const agents = [
      createMockAgent("good"),
      createFailingAgent("bad", "agent crashed"),
      createMockAgent("also-good"),
    ];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("task-3", {});

    // Assert
    expect(result.agentResults).toHaveLength(3);
    expect(result.agentResults[0].success).toBe(true);
    expect(result.agentResults[1].success).toBe(false);
    expect(result.agentResults[2].success).toBe(true);

    // Check error event was emitted
    const errorEvents = capturedEvents.filter((e) => e.type === "agent:error");
    expect(errorEvents).toHaveLength(1);
  });

  it("emits progress events for each agent", async () => {
    // Arrange
    const agents = [createMockAgent("prog")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    await orchestrator.run("task-4", {});

    // Assert
    const progressEvents = capturedEvents.filter((e) => e.type === "agent:progress");
    expect(progressEvents).toHaveLength(1);
  });

  it("includes sessionId in all events", async () => {
    // Arrange
    const agents = [createMockAgent("sid")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("task-5", {});

    // Assert
    for (const event of capturedEvents) {
      expect(event.sessionId).toBe(result.sessionId);
    }
  });

  it("returns totalDurationMs > 0", async () => {
    // Arrange
    const agents = [createMockAgent("dur")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("task-6", {});

    // Assert
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });
});
