import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ObservableOrchestrator } from "../ObservableOrchestrator";
import { SimulatedBackend } from "@/backend/execution/SimulatedBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { logger } from "@/core/observability/logger";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { AgentEvent, SessionStartEvent, SessionEndEvent, AgentCompleteEvent } from "@/core/events/types";
import type { LogEntry } from "@/core/observability/logger";

// Agent that uses SimulatedBackend internally
function createBackendAgent(id: string, delayMs: number = 10): Agent {
  const backend = new SimulatedBackend({ type: "simulated", timeoutMs: delayMs });
  return {
    id,
    name: `${id}Agent`,
    execute: async (input: AgentInput): Promise<AgentOutput> => {
      const task = { id: input.taskId, context: input.context };
      return backend.execute(task, input);
    },
  };
}

// Agent with configurable latency for ordering verification
function createTimedAgent(id: string, delayMs: number): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (input: AgentInput): Promise<AgentOutput> => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return {
        success: true,
        logs: [`${id} completed after ${delayMs}ms`],
        data: { agentId: id, taskId: input.taskId, delay: delayMs },
      };
    },
  };
}

describe("Integration: ObservableOrchestrator + SimulatedBackend", () => {
  let capturedEvents: AgentEvent[];
  let capturedLogs: LogEntry[];
  let eventSubId: string;

  beforeEach(() => {
    agentEventBus.clear();
    capturedEvents = [];
    capturedLogs = [];
    eventSubId = agentEventBus.subscribe((event) => capturedEvents.push(event));
    logger.addSink((entry) => capturedLogs.push(entry));
  });

  afterEach(() => {
    agentEventBus.unsubscribe(eventSubId);
  });

  it("produces end-to-end event lifecycle from backend-backed agents", async () => {
    // Arrange
    const agents = [createBackendAgent("alpha", 10), createBackendAgent("beta", 10)];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("integration-1", { env: "test" });

    // Assert — session result
    expect(result.agentResults).toHaveLength(2);
    expect(result.agentResults.every((r) => r.success)).toBe(true);
    expect(result.sessionId).toMatch(/^sess_/);
    expect(result.traceId).toMatch(/^trace_/);

    // Assert — event ordering
    const types = capturedEvents.map((e) => e.type);
    expect(types[0]).toBe("session:start");
    expect(types[types.length - 1]).toBe("session:end");

    // Each agent should produce: start, progress, log, complete
    const agentStarts = capturedEvents.filter((e) => e.type === "agent:start");
    const agentCompletes = capturedEvents.filter((e) => e.type === "agent:complete");
    expect(agentStarts).toHaveLength(2);
    expect(agentCompletes).toHaveLength(2);
  });

  it("propagates trace IDs consistently through all events", async () => {
    // Arrange
    const agents = [createBackendAgent("traced")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    const result = await orchestrator.run("trace-test", {});

    // Assert — all agent events share the session
    const sessionStart = capturedEvents.find((e) => e.type === "session:start") as SessionStartEvent;
    const sessionEnd = capturedEvents.find((e) => e.type === "session:end") as SessionEndEvent;

    expect(sessionStart.sessionId).toBe(result.sessionId);
    expect(sessionEnd.totalDurationMs).toBeGreaterThanOrEqual(0);

    // All events within the session share the same sessionId
    for (const event of capturedEvents) {
      expect(event.sessionId).toBe(result.sessionId);
    }
  });

  it("supports concurrent independent pipelines", async () => {
    // Arrange — two separate orchestrators running simultaneously
    const orch1 = new ObservableOrchestrator([createTimedAgent("fast", 10)]);
    const orch2 = new ObservableOrchestrator([createTimedAgent("slow", 50)]);

    // Act — run both concurrently
    const [result1, result2] = await Promise.all([
      orch1.run("pipeline-A", { lane: 1 }),
      orch2.run("pipeline-B", { lane: 2 }),
    ]);

    // Assert — both succeed independently
    expect(result1.agentResults[0].success).toBe(true);
    expect(result2.agentResults[0].success).toBe(true);
    expect(result1.sessionId).not.toBe(result2.sessionId);
    expect(result1.traceId).not.toBe(result2.traceId);

    // Both sessions' events are captured
    const sessionStarts = capturedEvents.filter((e) => e.type === "session:start");
    const sessionEnds = capturedEvents.filter((e) => e.type === "session:end");
    expect(sessionStarts).toHaveLength(2);
    expect(sessionEnds).toHaveLength(2);
  });

  it("generates structured log entries with trace context", async () => {
    // Arrange
    const agents = [createBackendAgent("logged")];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    await orchestrator.run("log-test", { debug: true });

    // Assert — structured logs were captured
    expect(capturedLogs.length).toBeGreaterThan(0);

    // At least one log should have trace context
    const tracedLogs = capturedLogs.filter((l) => l.traceId);
    expect(tracedLogs.length).toBeGreaterThan(0);

    // Check structured fields
    const infoLogs = capturedLogs.filter((l) => l.level === "INFO");
    expect(infoLogs.length).toBeGreaterThan(0);
  });

  it("parallel mode completes all agents even with varying latency", async () => {
    // Arrange — agents with different execution times
    const agents = [
      createTimedAgent("quick", 5),
      createTimedAgent("medium", 25),
      createTimedAgent("slow", 50),
    ];
    const orchestrator = new ObservableOrchestrator(agents, { parallel: true });

    // Act
    const result = await orchestrator.run("parallel-test", {});

    // Assert — all completed
    expect(result.agentResults).toHaveLength(3);
    expect(result.agentResults.every((r) => r.success)).toBe(true);

    // Parallel should finish faster than sequential sum
    const totalAgentTime = result.agentResults.reduce((sum, r) => sum + r.durationMs, 0);
    expect(result.totalDurationMs).toBeLessThan(totalAgentTime);
  });

  it("session end event contains accurate agent results", async () => {
    // Arrange
    const agents = [createBackendAgent("result-check", 5)];
    const orchestrator = new ObservableOrchestrator(agents);

    // Act
    await orchestrator.run("end-check", {});

    // Assert
    const endEvent = capturedEvents.find((e) => e.type === "session:end") as SessionEndEvent;
    expect(endEvent).toBeDefined();
    expect(endEvent.agentResults).toHaveLength(1);
    expect(endEvent.agentResults[0].agentId).toBe("result-check");
    expect(endEvent.agentResults[0].success).toBe(true);
    expect(endEvent.agentResults[0].durationMs).toBeGreaterThanOrEqual(0);
  });
});
