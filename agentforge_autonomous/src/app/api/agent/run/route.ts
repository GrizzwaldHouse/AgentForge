import { NextRequest, NextResponse } from "next/server";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { allAgents } from "@/agents/registry";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import type {
  SessionStartEvent,
  AgentStartEvent,
  AgentLogEvent,
  AgentCompleteEvent,
  AgentErrorEvent,
  SessionEndEvent,
} from "@/core/events/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const taskId = (body.taskId as string) || `task_${Date.now()}`;
  const context = (body.context as Record<string, unknown>) || {};
  const sessionId = `sess_${Date.now()}`;

  // Session start
  const sessionStart: SessionStartEvent = {
    id: createEventId(),
    type: EVENT_TYPES.SESSION_START,
    timestamp: Date.now(),
    sessionId,
    agentIds: allAgents.map((a) => a.id),
    taskId,
  };
  agentEventBus.emit(sessionStart);

  const agentResults: SessionEndEvent["agentResults"] = [];
  const sessionStartTime = Date.now();

  // Run agents sequentially so events stream in order
  for (const agent of allAgents) {
    const start = Date.now();

    const startEvent: AgentStartEvent = {
      id: createEventId(),
      type: EVENT_TYPES.AGENT_START,
      timestamp: Date.now(),
      sessionId,
      agentId: agent.id,
      taskId,
    };
    agentEventBus.emit(startEvent);

    try {
      const result = await agent.execute({ taskId, context });

      // Emit individual logs
      for (const log of result.logs) {
        const logEvent: AgentLogEvent = {
          id: createEventId(),
          type: EVENT_TYPES.AGENT_LOG,
          timestamp: Date.now(),
          sessionId,
          agentId: agent.id,
          taskId,
          message: log,
          level: "info",
        };
        agentEventBus.emit(logEvent);
      }

      const durationMs = Date.now() - start;
      const completeEvent: AgentCompleteEvent = {
        id: createEventId(),
        type: EVENT_TYPES.AGENT_COMPLETE,
        timestamp: Date.now(),
        sessionId,
        agentId: agent.id,
        taskId,
        durationMs,
        success: result.success,
        data: result.data,
      };
      agentEventBus.emit(completeEvent);

      agentResults.push({
        agentId: agent.id,
        success: result.success,
        durationMs,
      });
    } catch (err) {
      const errorEvent: AgentErrorEvent = {
        id: createEventId(),
        type: EVENT_TYPES.AGENT_ERROR,
        timestamp: Date.now(),
        sessionId,
        agentId: agent.id,
        taskId,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      };
      agentEventBus.emit(errorEvent);

      agentResults.push({
        agentId: agent.id,
        success: false,
        durationMs: Date.now() - start,
      });
    }
  }

  // Session end
  const sessionEnd: SessionEndEvent = {
    id: createEventId(),
    type: EVENT_TYPES.SESSION_END,
    timestamp: Date.now(),
    sessionId,
    totalDurationMs: Date.now() - sessionStartTime,
    agentResults,
  };
  agentEventBus.emit(sessionEnd);

  return NextResponse.json({
    sessionId,
    taskId,
    totalDurationMs: sessionEnd.totalDurationMs,
    agentResults,
  });
}
