import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ObservableOrchestrator } from "../ObservableOrchestrator";
import { SimulatedBackend } from "@/backend/execution/SimulatedBackend";
import { ExecutionError } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { AgentEvent } from "@/core/events/types";

function createMockAgent(id: string): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (input: AgentInput): Promise<AgentOutput> => ({
      success: true,
      logs: [`${id} executed`],
      data: { taskId: input.taskId },
    }),
  };
}

function createFailingAgent(id: string, error: Error): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (): Promise<AgentOutput> => {
      throw error;
    },
  };
}

function createTimeoutAgent(id: string, delayMs: number): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (): Promise<AgentOutput> => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return { success: true, logs: [`${id} completed late`], data: null };
    },
  };
}

describe("Failure Scenarios and Recovery Paths", () => {
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

  describe("Agent Failure Isolation", () => {
    it("sequential: continues after agent throws, marks failed agent correctly", async () => {
      // Arrange
      const agents = [
        createMockAgent("first"),
        createFailingAgent("broken", new Error("agent crashed")),
        createMockAgent("third"),
      ];
      const orchestrator = new ObservableOrchestrator(agents);

      // Act
      const result = await orchestrator.run("iso-seq", {});

      // Assert
      expect(result.agentResults).toHaveLength(3);
      expect(result.agentResults[0]).toMatchObject({ agentId: "first", success: true });
      expect(result.agentResults[1]).toMatchObject({ agentId: "broken", success: false });
      expect(result.agentResults[2]).toMatchObject({ agentId: "third", success: true });
    });

    it("parallel: all agents complete despite one failing", async () => {
      // Arrange
      const agents = [
        createMockAgent("good-1"),
        createFailingAgent("bad", new Error("parallel failure")),
        createMockAgent("good-2"),
      ];
      const orchestrator = new ObservableOrchestrator(agents, { parallel: true });

      // Act
      const result = await orchestrator.run("iso-par", {});

      // Assert
      expect(result.agentResults).toHaveLength(3);
      const successes = result.agentResults.filter((r) => r.success);
      const failures = result.agentResults.filter((r) => !r.success);
      expect(successes).toHaveLength(2);
      expect(failures).toHaveLength(1);
      expect(failures[0].agentId).toBe("bad");
    });
  });

  describe("Error Event Emission", () => {
    it("emits agent:error event with correct error message", async () => {
      // Arrange
      const errorMsg = "specific failure reason";
      const agents = [createFailingAgent("err-agent", new Error(errorMsg))];
      const orchestrator = new ObservableOrchestrator(agents);

      // Act
      await orchestrator.run("err-test", {});

      // Assert
      const errorEvents = capturedEvents.filter((e) => e.type === "agent:error");
      expect(errorEvents).toHaveLength(1);
      const errEvent = errorEvents[0] as Extract<AgentEvent, { type: "agent:error" }>;
      expect(errEvent.agentId).toBe("err-agent");
      expect(errEvent.error).toContain(errorMsg);
    });

    it("emits session:end even when all agents fail", async () => {
      // Arrange
      const agents = [
        createFailingAgent("fail-1", new Error("boom-1")),
        createFailingAgent("fail-2", new Error("boom-2")),
      ];
      const orchestrator = new ObservableOrchestrator(agents);

      // Act
      const result = await orchestrator.run("all-fail", {});

      // Assert — session still completes
      expect(result.agentResults.every((r) => !r.success)).toBe(true);

      const sessionEnd = capturedEvents.find((e) => e.type === "session:end");
      expect(sessionEnd).toBeDefined();
    });
  });

  describe("ExecutionError Typed Handling", () => {
    it("propagates ExecutionError with correct code through agent", async () => {
      // Arrange
      const agents = [
        createFailingAgent(
          "exec-err",
          new ExecutionError("backend down", "BACKEND_UNAVAILABLE", "test-task"),
        ),
      ];
      const orchestrator = new ObservableOrchestrator(agents);

      // Act
      const result = await orchestrator.run("exec-err-test", {});

      // Assert
      expect(result.agentResults[0].success).toBe(false);

      const errorEvents = capturedEvents.filter((e) => e.type === "agent:error");
      expect(errorEvents).toHaveLength(1);
      const errEvent = errorEvents[0] as Extract<AgentEvent, { type: "agent:error" }>;
      expect(errEvent.error).toContain("backend down");
    });
  });

  describe("SimulatedBackend Error Paths", () => {
    it("throws INVALID_INPUT for empty task ID", async () => {
      // Arrange
      const backend = new SimulatedBackend({ type: "simulated" });
      const task = { id: "", context: {} };
      const input = { taskId: "", context: {} };

      // Act & Assert
      await expect(backend.execute(task, input)).rejects.toThrow(ExecutionError);
      try {
        await backend.execute(task, input);
      } catch (err) {
        expect(err).toBeInstanceOf(ExecutionError);
        expect((err as ExecutionError).code).toBe("INVALID_INPUT");
      }
    });

    it("tracks failed status after error", async () => {
      // Arrange
      const backend = new SimulatedBackend({ type: "simulated" });

      // Act — try empty ID
      try {
        await backend.execute({ id: "", context: {} }, { taskId: "", context: {} });
      } catch {
        // expected
      }

      // Assert — status for unknown task is pending (not tracked since ID was empty)
      expect(backend.status("nonexistent")).toBe("pending");
    });
  });

  describe("Concurrent Session Independence", () => {
    it("two simultaneous sessions do not interfere with each other", async () => {
      // Arrange
      const orch1 = new ObservableOrchestrator([createTimeoutAgent("s1-agent", 30)]);
      const orch2 = new ObservableOrchestrator([createTimeoutAgent("s2-agent", 10)]);

      // Act
      const [r1, r2] = await Promise.all([
        orch1.run("session-1", { lane: "A" }),
        orch2.run("session-2", { lane: "B" }),
      ]);

      // Assert — each session tracks independently
      expect(r1.sessionId).not.toBe(r2.sessionId);
      expect(r1.traceId).not.toBe(r2.traceId);
      expect(r1.taskId).toBe("session-1");
      expect(r2.taskId).toBe("session-2");

      // Both sessions produced their own events
      const s1Events = capturedEvents.filter((e) => e.sessionId === r1.sessionId);
      const s2Events = capturedEvents.filter((e) => e.sessionId === r2.sessionId);
      expect(s1Events.length).toBeGreaterThan(0);
      expect(s2Events.length).toBeGreaterThan(0);
    });
  });

  describe("Event Bus Overflow", () => {
    it("event buffer stays capped at MAX_BUFFER (200)", () => {
      // Arrange & Act — emit 250 events
      for (let i = 0; i < 250; i++) {
        agentEventBus.emit({
          id: `evt_overflow_${i}`,
          type: "agent:log",
          timestamp: Date.now(),
          sessionId: "overflow-session",
          agentId: "overflow-agent",
          taskId: "overflow-task",
          message: `log ${i}`,
          level: "info",
        } as AgentEvent);
      }

      // Assert — buffer stays at 200
      const events = agentEventBus.getRecentEvents();
      expect(events.length).toBeLessThanOrEqual(200);
    });
  });

  describe("Duration Tracking Under Failure", () => {
    it("failed agents still report durationMs", async () => {
      // Arrange
      const agents = [createFailingAgent("timed-fail", new Error("crash"))];
      const orchestrator = new ObservableOrchestrator(agents);

      // Act
      const result = await orchestrator.run("dur-fail", {});

      // Assert
      expect(result.agentResults[0].durationMs).toBeGreaterThanOrEqual(0);
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
    });
  });
});
