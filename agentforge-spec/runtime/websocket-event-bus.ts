import { EventBus, EventHandler } from "../core/event-bus.interface";
import { SystemEvent } from "@agentforge/contracts";
import { isSystemEvent } from "@agentforge/validation";

export class WebSocketEventBus implements EventBus {
  private socket?: WebSocket;
  private handlers = new Map<string, Set<EventHandler>>();

  constructor(private readonly url: string) {}

  async connect(): Promise<void> {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      if (!isSystemEvent(parsed)) return;
      this.dispatch(parsed);
    };
  }

  publish(event: SystemEvent): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.socket.send(JSON.stringify(event));
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
    this.socket?.close();
    this.handlers.clear();
  }
}