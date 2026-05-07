import { agentEventBus } from "@/core/events/agent-event-bus";
import type { AgentEvent, AgentEventType } from "@/core/events/types";

export interface EventBackend {
  publish(event: AgentEvent): void;
  subscribe(eventType: AgentEventType, handler: (event: AgentEvent) => void): () => void;
}

export class NATSEventBackend implements EventBackend {
  constructor(private config: { natsUrl?: string }) {}

  publish(event: AgentEvent): void {
    agentEventBus.emit(event);
  }

  subscribe(eventType: AgentEventType, handler: (event: AgentEvent) => void): () => void {
    const wrappedHandler = (event: AgentEvent) => {
      if (event.type === eventType) {
        handler(event);
      }
    };
    const subId = agentEventBus.subscribe(wrappedHandler);
    return () => agentEventBus.unsubscribe(subId);
  }
}
