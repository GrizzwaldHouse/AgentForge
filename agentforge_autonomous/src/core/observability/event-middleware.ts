// Middleware that bridges observability (logger + traces) with the event bus

import { agentEventBus } from "@/core/events/agent-event-bus";
import { logger } from "./logger";
import type { AgentEvent } from "@/core/events/types";

const LEVEL_MAP: Record<string, "INFO" | "ERROR" | "DEBUG"> = {
  "agent:start": "INFO",
  "agent:complete": "INFO",
  "agent:error": "ERROR",
  "agent:log": "DEBUG",
  "agent:progress": "DEBUG",
  "session:start": "INFO",
  "session:end": "INFO",
  heartbeat: "DEBUG",
};

function handleEvent(event: AgentEvent): void {
  const level = LEVEL_MAP[event.type] ?? "DEBUG";
  const agentId = "agentId" in event ? event.agentId : undefined;
  const taskId = "taskId" in event ? event.taskId : undefined;

  let message: string;
  switch (event.type) {
    case "agent:start":
      message = `Agent started`;
      break;
    case "agent:complete":
      message = `Agent completed (success=${event.success}, ${event.durationMs}ms)`;
      break;
    case "agent:error":
      message = `Agent error: ${event.error}`;
      break;
    case "agent:log":
      message = `[${event.level}] ${event.message}`;
      break;
    case "agent:progress":
      message = `Progress: ${event.progress}%${event.message ? ` - ${event.message}` : ""}`;
      break;
    case "session:start":
      message = `Session started with ${event.agentIds.length} agents`;
      break;
    case "session:end":
      message = `Session ended (${event.totalDurationMs}ms, ${event.agentResults.length} agents)`;
      break;
    case "heartbeat":
      message = "Heartbeat";
      break;
  }

  logger.log(level, message, { agentId, taskId });
}

let subscriptionId: string | null = null;

export function attachLoggingMiddleware(): void {
  if (subscriptionId) return; // Already attached
  subscriptionId = agentEventBus.subscribe(handleEvent);
}

export function detachLoggingMiddleware(): void {
  if (subscriptionId) {
    agentEventBus.unsubscribe(subscriptionId);
    subscriptionId = null;
  }
}
