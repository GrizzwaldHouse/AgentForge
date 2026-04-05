export const AGENT_COLORS: Record<string, string> = {
  planner: "#4f8fff",
  builder: "#34d399",
  reviewer: "#fbbf24",
  tester: "#f87171",
  learning: "#a78bfa",
  context: "#f472b6",
};

export const EVENT_TYPES = {
  AGENT_START: "agent:start",
  AGENT_PROGRESS: "agent:progress",
  AGENT_LOG: "agent:log",
  AGENT_COMPLETE: "agent:complete",
  AGENT_ERROR: "agent:error",
  SESSION_START: "session:start",
  SESSION_END: "session:end",
  HEARTBEAT: "heartbeat",
} as const;

export const REPLAY_SPEEDS = [0.5, 1, 2, 4, 8] as const;

export const SSE_HEARTBEAT_MS = 30_000;
