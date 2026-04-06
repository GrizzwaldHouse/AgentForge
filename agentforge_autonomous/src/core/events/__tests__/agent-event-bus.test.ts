import { describe, it, expect, beforeEach } from "vitest";
import { agentEventBus } from "../agent-event-bus";
import { createEventId } from "../types";
import { EVENT_TYPES } from "@/lib/constants";
import type { AgentEvent, HeartbeatEvent, AgentStartEvent } from "../types";

function makeHeartbeat(sessionId = "test-session"): HeartbeatEvent {
  return {
    id: createEventId(),
    type: EVENT_TYPES.HEARTBEAT,
    timestamp: Date.now(),
    sessionId,
  };
}

describe("AgentEventBus", () => {
  beforeEach(() => {
    agentEventBus.clear();
  });

  it("emits events to subscribers", () => {
    // Arrange
    const received: AgentEvent[] = [];
    const subId = agentEventBus.subscribe((e) => received.push(e));

    // Act
    const event = makeHeartbeat();
    agentEventBus.emit(event);

    // Assert
    expect(received).toHaveLength(1);
    expect(received[0]).toBe(event);

    // Cleanup
    agentEventBus.unsubscribe(subId);
  });

  it("stores events in buffer", () => {
    // Arrange & Act
    agentEventBus.emit(makeHeartbeat());
    agentEventBus.emit(makeHeartbeat());

    // Assert
    expect(agentEventBus.getRecentEvents()).toHaveLength(2);
  });

  it("caps buffer at 200 events", () => {
    // Arrange & Act
    for (let i = 0; i < 250; i++) {
      agentEventBus.emit(makeHeartbeat());
    }

    // Assert
    expect(agentEventBus.getRecentEvents()).toHaveLength(200);
  });

  it("unsubscribes correctly", () => {
    // Arrange
    const received: AgentEvent[] = [];
    const subId = agentEventBus.subscribe((e) => received.push(e));

    // Act
    agentEventBus.unsubscribe(subId);
    agentEventBus.emit(makeHeartbeat());

    // Assert
    expect(received).toHaveLength(0);
  });

  it("clear empties the buffer", () => {
    // Arrange
    agentEventBus.emit(makeHeartbeat());
    expect(agentEventBus.getRecentEvents().length).toBeGreaterThan(0);

    // Act
    agentEventBus.clear();

    // Assert
    expect(agentEventBus.getRecentEvents()).toHaveLength(0);
  });

  it("returns a copy of events, not the buffer reference", () => {
    // Arrange
    agentEventBus.emit(makeHeartbeat());

    // Act
    const events = agentEventBus.getRecentEvents();
    events.push(makeHeartbeat()); // Mutate returned array

    // Assert — original buffer unchanged
    expect(agentEventBus.getRecentEvents()).toHaveLength(1);
  });
});
