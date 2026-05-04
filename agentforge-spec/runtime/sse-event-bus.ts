import { EventBus, EventHandler } from "../core/event-bus.interface";
import { SystemEvent } from "@agentforge/contracts";
import { isSystemEvent } from "@agentforge/validation";

export class SSEEventBus implements EventBus {
  private eventSource?: EventSource;
  private handlers = new Map<string, Set<EventHandler>>();

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    this.eventSource = new EventSource(this.url);
    this.eventSource.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      if (!isSystemEvent(parsed)) return;
      this.dispatch(parsed);
    };
  }

  publish(): void {
    throw new Error("SSE is read-only. Use WebSocket transport for commands.");
  }

  subscribe(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    const set = this.handlers.get(type)!;
    set.add(handler);
    return () => set.delete(handler);
  }

  private dispatch(event: SystemEvent) {
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;
    handlers.forEach((h) => h(event));
  }

  async disconnect(): Promise<void> {
    this.eventSource?.close();
  }
}