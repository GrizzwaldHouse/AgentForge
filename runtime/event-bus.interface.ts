import { SystemEvent } from "@agentforge/contracts";

export type EventHandler<T extends SystemEvent = SystemEvent> = (event: T) => void;

export interface EventBus {
  publish(event: SystemEvent): void;
  subscribe<T extends SystemEvent>(
    type: T["type"],
    handler: EventHandler<T>
  ): () => void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}