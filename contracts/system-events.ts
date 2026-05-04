import { BaseEvent } from "./base-event";
import { GraphNode, GraphEdge } from "../graph/graph";

export type SystemEvent =
  | SystemStateChangedEvent
  | AgentExecutedEvent
  | GraphUpdatedEvent
  | ConfigChangedEvent
  | LogEvent;

export interface SystemStateChangedEvent
  extends BaseEvent<{ state: "idle" | "running" | "error" }> {
  type: "system.state.changed";
}

export interface AgentExecutedEvent
  extends BaseEvent<{
    agentId: string;
    status: "started" | "completed" | "failed";
    durationMs: number;
  }> {
  type: "agent.executed";
}

export interface GraphUpdatedEvent
  extends BaseEvent<{
    nodes: GraphNode[];
    edges: GraphEdge[];
  }> {
  type: "graph.updated";
}

export interface ConfigChangedEvent
  extends BaseEvent<{
    key: string;
    value: unknown;
  }> {
  type: "config.changed";
}

export interface LogEvent
  extends BaseEvent<{
    level: "ERROR" | "WARN" | "INFO" | "DEBUG";
    message: string;
  }> {
  type: "log.emitted";
}