export type EventId = string;
export type ISO8601 = string;

export interface BaseEvent<TPayload = unknown> {
  readonly id: EventId;
  readonly type: string;
  readonly timestamp: ISO8601;
  readonly source: string;
  readonly schemaVersion: string;
  readonly payload: Readonly<TPayload>;
}