import { describe, it, expect } from "vitest";
import { deriveProgress } from "../progress";
import type { AgentEvent } from "@/core/events/types";

const AGENT_IDS = ["planner", "builder", "reviewer", "tester", "learning", "context"];

function makeEvent(partial: Partial<AgentEvent> & { type: string }): AgentEvent {
  return {
    id: "evt_1",
    timestamp: Date.now(),
    sessionId: "sess_1",
    ...partial,
  } as AgentEvent;
}

describe("deriveProgress", () => {
  it("returns idle state with no events", () => {
    const state = deriveProgress([], AGENT_IDS);
    expect(state.globalProgress).toBe(0);
    expect(state.isRunning).toBe(false);
    expect(state.isComplete).toBe(false);
    expect(state.currentAgentId).toBeNull();
    expect(state.totalSteps).toBe(6);
  });

  it("sets isRunning on session:start", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.isRunning).toBe(true);
    expect(state.isComplete).toBe(false);
  });

  it("tracks agent:start as running with currentAgentId", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1" }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.currentAgentId).toBe("planner");
    expect(state.currentStepName).toBe("Planning");
    expect(state.agentProgress.get("planner")?.status).toBe("running");
  });

  it("updates agent progress on agent:progress", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1" }),
      makeEvent({ type: "agent:progress", agentId: "planner", taskId: "t1", progress: 50 }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.agentProgress.get("planner")?.progress).toBe(50);
  });

  it("calculates globalProgress from completed agents", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1" }),
      makeEvent({ type: "agent:complete", agentId: "planner", taskId: "t1", durationMs: 100, success: true }),
      makeEvent({ type: "agent:start", agentId: "builder", taskId: "t1" }),
      makeEvent({ type: "agent:complete", agentId: "builder", taskId: "t1", durationMs: 200, success: true }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    // 2 of 6 agents complete = 33%
    expect(state.globalProgress).toBe(33);
    expect(state.currentStep).toBe(3);
  });

  it("marks agent as error on agent:error", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "builder", taskId: "t1" }),
      makeEvent({ type: "agent:error", agentId: "builder", taskId: "t1", error: "fail" }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.agentProgress.get("builder")?.status).toBe("error");
  });

  it("sets isComplete on session:end", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({
        type: "session:end",
        totalDurationMs: 500,
        agentResults: AGENT_IDS.map((id) => ({ agentId: id, success: true, durationMs: 80 })),
      }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.isComplete).toBe(true);
    expect(state.isRunning).toBe(false);
  });

  it("handles empty agentIds gracefully", () => {
    const state = deriveProgress([], []);
    expect(state.globalProgress).toBe(0);
    expect(state.totalSteps).toBe(0);
  });

  it("uses stepName from event when provided", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1", stepName: "Analysis" }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.currentStepName).toBe("Analysis");
    expect(state.agentProgress.get("planner")?.stepName).toBe("Analysis");
  });

  it("currentStep starts at 1 when running with no completions", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      makeEvent({ type: "agent:start", agentId: "planner", taskId: "t1" }),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.currentStep).toBe(1);
  });

  it("100% progress when all agents complete", () => {
    const events: AgentEvent[] = [
      makeEvent({ type: "session:start", agentIds: AGENT_IDS, taskId: "t1" }),
      ...AGENT_IDS.flatMap((id) => [
        makeEvent({ type: "agent:start", agentId: id, taskId: "t1" }),
        makeEvent({ type: "agent:complete", agentId: id, taskId: "t1", durationMs: 100, success: true }),
      ]),
    ];
    const state = deriveProgress(events, AGENT_IDS);
    expect(state.globalProgress).toBe(100);
  });
});
