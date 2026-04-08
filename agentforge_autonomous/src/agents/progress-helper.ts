import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import type { AgentProgressEvent } from "@/core/events/types";

/** Emit a progress event with a human-readable message. */
export function emitProgress(opts: {
  sessionId: string;
  agentId: string;
  taskId: string;
  progress: number;
  humanMessage: string;
  stepName?: string;
}): void {
  const event: AgentProgressEvent = {
    id: createEventId(),
    type: EVENT_TYPES.AGENT_PROGRESS,
    timestamp: Date.now(),
    sessionId: opts.sessionId,
    agentId: opts.agentId,
    taskId: opts.taskId,
    progress: opts.progress,
    message: opts.humanMessage,
    humanMessage: opts.humanMessage,
    stepName: opts.stepName,
  };
  agentEventBus.emit(event);
}
