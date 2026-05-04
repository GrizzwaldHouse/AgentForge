import { EventBus, EventHandler } from "./event-bus.interface";
import { SystemEvent } from "@agentforge/contracts";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  publish(event: SystemEvent): void {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;
    handlers.forEach((handler) => handler(event));
  }

  subscribe(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const set = this.handlers.get(type)!;
    set.add(handler);
    return () => set.delete(handler);
  }

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {
    this.handlers.clear();
  }
}