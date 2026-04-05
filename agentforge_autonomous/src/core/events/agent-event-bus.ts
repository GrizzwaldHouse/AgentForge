import { EventEmitter } from "events";
import type { AgentEvent } from "./types";

const MAX_BUFFER = 200;

class AgentEventBus {
  private emitter = new EventEmitter();
  private buffer: AgentEvent[] = [];
  private subCounter = 0;

  emit(event: AgentEvent): void {
    this.buffer.push(event);
    if (this.buffer.length > MAX_BUFFER) {
      this.buffer = this.buffer.slice(-MAX_BUFFER);
    }
    this.emitter.emit("event", event);
  }

  subscribe(handler: (event: AgentEvent) => void): string {
    const id = `sub_${++this.subCounter}`;
    this.emitter.on("event", handler);
    // Store handler ref for unsubscribe
    (this.emitter as unknown as Record<string, unknown>)[id] = handler;
    return id;
  }

  unsubscribe(id: string): void {
    const handler = (this.emitter as unknown as Record<string, unknown>)[id] as
      | ((event: AgentEvent) => void)
      | undefined;
    if (handler) {
      this.emitter.off("event", handler);
      delete (this.emitter as unknown as Record<string, unknown>)[id];
    }
  }

  getRecentEvents(): AgentEvent[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

// Singleton
export const agentEventBus = new AgentEventBus();
