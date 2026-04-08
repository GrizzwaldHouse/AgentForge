import { describe, it, expect } from "vitest";
import { narrativeMap } from "../narrative";
import type { AgentEvent } from "@/core/events/types";

function makeEvent(partial: Partial<AgentEvent> & { type: string }): AgentEvent {
  return {
    id: "evt_1",
    timestamp: Date.now(),
    sessionId: "sess_1",
    ...partial,
  } as AgentEvent;
}

describe("narrativeMap", () => {
  it("returns null for heartbeat events", () => {
    const result = narrativeMap(makeEvent({ type: "heartbeat" }));
    expect(result).toBeNull();
  });

  it("maps session:start to Session phase", () => {
    const result = narrativeMap(
      makeEvent({
        type: "session:start",
        agentIds: ["planner", "builder", "reviewer"],
        taskId: "t1",
      }),
    );
    expect(result).not.toBeNull();
    expect(result!.phase).toBe("Session");
    expect(result!.message).toContain("3 agents");
    expect(result!.level).toBe("info");
  });

  it("uses humanMessage from session:start when present", () => {
    const result = narrativeMap(
      makeEvent({
        type: "session:start",
        agentIds: ["planner"],
        taskId: "t1",
        humanMessage: "Custom session message",
      }),
    );
    expect(result!.message).toBe("Custom session message");
  });

  it("maps session:end with success count", () => {
    const result = narrativeMap(
      makeEvent({
        type: "session:end",
        totalDurationMs: 1200,
        agentResults: [
          { agentId: "planner", success: true, durationMs: 500 },
          { agentId: "builder", success: true, durationMs: 700 },
        ],
      }),
    );
    expect(result!.phase).toBe("Session");
    expect(result!.message).toContain("2/2");
    expect(result!.message).toContain("1.2s");
    expect(result!.level).toBe("success");
  });

  it("maps session:end with failures as warn", () => {
    const result = narrativeMap(
      makeEvent({
        type: "session:end",
        totalDurationMs: 1000,
        agentResults: [
          { agentId: "planner", success: true, durationMs: 500 },
          { agentId: "builder", success: false, durationMs: 500 },
        ],
      }),
    );
    expect(result!.level).toBe("warn");
    expect(result!.message).toContain("1/2");
  });

  it("maps agent:start to correct phase", () => {
    const result = narrativeMap(
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1" }),
    );
    expect(result!.phase).toBe("Planning");
    expect(result!.message).toContain("plan");
  });

  it("maps builder agent to Building phase", () => {
    const result = narrativeMap(
      makeEvent({ type: "agent:start", agentId: "builder", taskId: "t1" }),
    );
    expect(result!.phase).toBe("Building");
  });

  it("maps agent:progress with default message", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:progress",
        agentId: "reviewer",
        taskId: "t1",
        progress: 50,
        message: "Checking imports",
      }),
    );
    expect(result!.phase).toBe("Reviewing");
    expect(result!.message).toContain("50%");
    expect(result!.message).toContain("Checking imports");
  });

  it("maps agent:log with level mapping", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:log",
        agentId: "tester",
        taskId: "t1",
        message: "Test failed",
        level: "error",
      }),
    );
    expect(result!.phase).toBe("Testing");
    expect(result!.level).toBe("error");
  });

  it("maps agent:complete success", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:complete",
        agentId: "learning",
        taskId: "t1",
        durationMs: 250,
        success: true,
      }),
    );
    expect(result!.phase).toBe("Learning");
    expect(result!.level).toBe("success");
    expect(result!.message).toContain("Insights captured");
    expect(result!.message).toContain("250ms");
  });

  it("maps agent:complete failure", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:complete",
        agentId: "builder",
        taskId: "t1",
        durationMs: 1500,
        success: false,
      }),
    );
    expect(result!.level).toBe("error");
    expect(result!.message).toContain("failed");
    expect(result!.message).toContain("1.5s");
  });

  it("maps agent:error", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:error",
        agentId: "context",
        taskId: "t1",
        error: "Out of memory",
      }),
    );
    expect(result!.phase).toBe("Cleanup");
    expect(result!.level).toBe("error");
    expect(result!.message).toContain("Out of memory");
  });

  it("uses humanMessage override on agent:complete", () => {
    const result = narrativeMap(
      makeEvent({
        type: "agent:complete",
        agentId: "planner",
        taskId: "t1",
        durationMs: 100,
        success: true,
        humanMessage: "Plan ready with 5 steps",
      }),
    );
    expect(result!.message).toBe("Plan ready with 5 steps");
  });

  it("preserves event id and timestamp", () => {
    const ts = 1700000000000;
    const result = narrativeMap(
      makeEvent({
        id: "evt_custom",
        type: "agent:start",
        agentId: "planner",
        taskId: "t1",
        timestamp: ts,
      }),
    );
    expect(result!.id).toBe("evt_custom");
    expect(result!.timestamp).toBe(ts);
  });

  it("assigns correct color from AGENT_COLORS", () => {
    const result = narrativeMap(
      makeEvent({ type: "agent:start", agentId: "builder", taskId: "t1" }),
    );
    expect(result!.color).toBe("#34d399"); // builder green
  });
});
