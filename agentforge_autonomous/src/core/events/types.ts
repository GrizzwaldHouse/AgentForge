import { EVENT_TYPES } from "@/lib/constants";

// Base event shape shared by all events
export interface BaseEvent {
  id: string;
  timestamp: number;
  sessionId: string;
}

// Agent-scoped events
export interface AgentStartEvent extends BaseEvent {
  type: typeof EVENT_TYPES.AGENT_START;
  agentId: string;
  taskId: string;
}

export interface AgentProgressEvent extends BaseEvent {
  type: typeof EVENT_TYPES.AGENT_PROGRESS;
  agentId: string;
  taskId: string;
  progress: number; // 0-100
  message?: string;
}

export interface AgentLogEvent extends BaseEvent {
  type: typeof EVENT_TYPES.AGENT_LOG;
  agentId: string;
  taskId: string;
  message: string;
  level: "info" | "warn" | "error" | "debug";
}

export interface AgentCompleteEvent extends BaseEvent {
  type: typeof EVENT_TYPES.AGENT_COMPLETE;
  agentId: string;
  taskId: string;
  durationMs: number;
  success: boolean;
  data?: unknown;
}

export interface AgentErrorEvent extends BaseEvent {
  type: typeof EVENT_TYPES.AGENT_ERROR;
  agentId: string;
  taskId: string;
  error: string;
  stack?: string;
}

// Session-scoped events
export interface SessionStartEvent extends BaseEvent {
  type: typeof EVENT_TYPES.SESSION_START;
  agentIds: string[];
  taskId: string;
}

export interface SessionEndEvent extends BaseEvent {
  type: typeof EVENT_TYPES.SESSION_END;
  totalDurationMs: number;
  agentResults: Array<{
    agentId: string;
    success: boolean;
    durationMs: number;
  }>;
}

// Heartbeat (keep-alive)
export interface HeartbeatEvent extends BaseEvent {
  type: typeof EVENT_TYPES.HEARTBEAT;
}

// Discriminated union of all events
export type AgentEvent =
  | AgentStartEvent
  | AgentProgressEvent
  | AgentLogEvent
  | AgentCompleteEvent
  | AgentErrorEvent
  | SessionStartEvent
  | SessionEndEvent
  | HeartbeatEvent;

// Extract event type string union
export type AgentEventType = AgentEvent["type"];

// Helper to create unique event IDs
let eventCounter = 0;
export function createEventId(): string {
  return `evt_${Date.now()}_${++eventCounter}`;
}
