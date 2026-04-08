import type { AgentEvent } from "@/core/events/types";
import { AGENT_COLORS } from "@/lib/constants";

export type NarrativePhase =
  | "Planning"
  | "Building"
  | "Reviewing"
  | "Testing"
  | "Learning"
  | "Cleanup"
  | "Session";

export interface NarrativeEntry {
  id: string;
  timestamp: number;
  phase: NarrativePhase;
  message: string;
  agentId?: string;
  color: string;
  level: "info" | "warn" | "error" | "success";
}

const AGENT_PHASE_MAP: Record<string, NarrativePhase> = {
  planner: "Planning",
  builder: "Building",
  reviewer: "Reviewing",
  tester: "Testing",
  learning: "Learning",
  context: "Cleanup",
};

const AGENT_NAME_MAP: Record<string, string> = {
  planner: "Planner",
  builder: "Builder",
  reviewer: "Reviewer",
  tester: "Tester",
  learning: "Learning Agent",
  context: "Context Manager",
};

/** Friendly verb phrases for agent start events. */
const AGENT_START_MESSAGE: Record<string, string> = {
  planner: "Creating a plan...",
  builder: "Building your code...",
  reviewer: "Reviewing code quality...",
  tester: "Running tests...",
  learning: "Learning from results...",
  context: "Cleaning up...",
};

/** Friendly verb phrases for agent completion events. */
const AGENT_COMPLETE_MESSAGE: Record<string, string> = {
  planner: "Plan created",
  builder: "Code built",
  reviewer: "Review complete",
  tester: "Tests finished",
  learning: "Insights captured",
  context: "Cleanup done",
};

function agentPhase(agentId: string): NarrativePhase {
  return AGENT_PHASE_MAP[agentId] ?? "Session";
}

function agentName(agentId: string): string {
  return AGENT_NAME_MAP[agentId] ?? agentId;
}

function agentColor(agentId?: string): string {
  if (!agentId) return "var(--accent-amber)";
  return AGENT_COLORS[agentId] ?? "var(--accent-blue)";
}

/** Maps a raw AgentEvent to a human-readable NarrativeEntry, or null for heartbeats. */
export function narrativeMap(event: AgentEvent): NarrativeEntry | null {
  switch (event.type) {
    case "heartbeat":
      return null;

    case "session:start":
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: "Session",
        message:
          event.humanMessage ??
          `Starting pipeline with ${event.agentIds.length} agents...`,
        color: "var(--accent-amber)",
        level: "info",
      };

    case "session:end": {
      const succeeded = event.agentResults.filter((r) => r.success).length;
      const total = event.agentResults.length;
      const seconds = (event.totalDurationMs / 1000).toFixed(1);
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: "Session",
        message:
          event.humanMessage ??
          `All done \u2014 ${succeeded}/${total} steps succeeded (${seconds}s)`,
        color: "var(--accent-amber)",
        level: succeeded === total ? "success" : "warn",
      };
    }

    case "agent:start":
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: agentPhase(event.agentId),
        message:
          event.humanMessage ??
          (AGENT_START_MESSAGE[event.agentId] ?? `Starting ${agentName(event.agentId)}...`),
        agentId: event.agentId,
        color: agentColor(event.agentId),
        level: "info",
      };

    case "agent:progress":
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: agentPhase(event.agentId),
        message:
          event.humanMessage ??
          `${event.progress}% complete${event.message ? ` \u2014 ${event.message}` : ""}`,
        agentId: event.agentId,
        color: agentColor(event.agentId),
        level: "info",
      };

    case "agent:log":
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: agentPhase(event.agentId),
        message:
          event.humanMessage ??
          `${agentName(event.agentId)}: ${event.message}`,
        agentId: event.agentId,
        color: agentColor(event.agentId),
        level: event.level === "error" ? "error" : event.level === "warn" ? "warn" : "info",
      };

    case "agent:complete": {
      const dur =
        event.durationMs < 1000
          ? `${event.durationMs}ms`
          : `${(event.durationMs / 1000).toFixed(1)}s`;
      const friendlyComplete = AGENT_COMPLETE_MESSAGE[event.agentId];
      const fallbackComplete = `${agentName(event.agentId)} ${event.success ? "complete" : "failed"}`;
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: agentPhase(event.agentId),
        message:
          event.humanMessage ??
          `${event.success ? (friendlyComplete ?? fallbackComplete) : fallbackComplete} (${dur})`,
        agentId: event.agentId,
        color: agentColor(event.agentId),
        level: event.success ? "success" : "error",
      };
    }

    case "agent:error":
      return {
        id: event.id,
        timestamp: event.timestamp,
        phase: agentPhase(event.agentId),
        message:
          event.humanMessage ??
          `Something went wrong: ${event.error}`,
        agentId: event.agentId,
        color: agentColor(event.agentId),
        level: "error",
      };

    default:
      return null;
  }
}
