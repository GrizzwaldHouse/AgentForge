import type { Agent, AgentInput } from "@/core/interfaces/Agent";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { createTraceContext, childSpan } from "@/core/observability/trace";
import { logger } from "@/core/observability/logger";
import type {
  SessionStartEvent,
  SessionEndEvent,
  AgentStartEvent,
  AgentLogEvent,
  AgentProgressEvent,
  AgentCompleteEvent,
  AgentErrorEvent,
} from "@/core/events/types";

export interface OrchestratorConfig {
  parallel?: boolean; // Run agents in parallel (default: false for ordered streaming)
}

export interface SessionResult {
  sessionId: string;
  taskId: string;
  traceId: string;
  totalDurationMs: number;
  agentResults: SessionEndEvent["agentResults"];
}

let sessionCounter = 0;

export class ObservableOrchestrator {
  constructor(
    private readonly agents: Agent[],
    private readonly config: OrchestratorConfig = {},
  ) {
    if (!agents || agents.length === 0) {
      throw new Error("ObservableOrchestrator requires at least one agent");
    }
  }

  async run(taskId: string, context: Record<string, unknown>): Promise<SessionResult> {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("taskId must be a non-empty string");
    }
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      throw new Error("context must be a plain object");
    }

    const sessionId = `sess_${Date.now()}_${++sessionCounter}`;
    const trace = createTraceContext();
    const sessionStart = Date.now();

    logger.info("Orchestration starting", {
      trace,
      taskId,
      data: { agentCount: this.agents.length, parallel: !!this.config.parallel },
    });

    // Session start event
    const startEvent: SessionStartEvent = {
      id: createEventId(),
      type: EVENT_TYPES.SESSION_START,
      timestamp: Date.now(),
      sessionId,
      agentIds: this.agents.map((a) => a.id),
      taskId,
    };
    agentEventBus.emit(startEvent);

    const input: AgentInput = { taskId, context };
    let agentResults: SessionEndEvent["agentResults"];

    if (this.config.parallel) {
      agentResults = await this.runParallel(sessionId, input, trace);
    } else {
      agentResults = await this.runSequential(sessionId, input, trace);
    }

    const totalDurationMs = Date.now() - sessionStart;

    // Session end event
    const endEvent: SessionEndEvent = {
      id: createEventId(),
      type: EVENT_TYPES.SESSION_END,
      timestamp: Date.now(),
      sessionId,
      totalDurationMs,
      agentResults,
    };
    agentEventBus.emit(endEvent);

    logger.info("Orchestration complete", {
      trace,
      taskId,
      durationMs: totalDurationMs,
      data: {
        succeeded: agentResults.filter((r) => r.success).length,
        failed: agentResults.filter((r) => !r.success).length,
      },
    });

    return { sessionId, taskId, traceId: trace.traceId, totalDurationMs, agentResults };
  }

  private async runSequential(
    sessionId: string,
    input: AgentInput,
    parentTrace: ReturnType<typeof createTraceContext>,
  ): Promise<SessionEndEvent["agentResults"]> {
    const results: SessionEndEvent["agentResults"] = [];

    for (const agent of this.agents) {
      const result = await this.executeAgent(agent, sessionId, input, parentTrace);
      results.push(result);
    }

    return results;
  }

  private async runParallel(
    sessionId: string,
    input: AgentInput,
    parentTrace: ReturnType<typeof createTraceContext>,
  ): Promise<SessionEndEvent["agentResults"]> {
    return Promise.all(
      this.agents.map((agent) =>
        this.executeAgent(agent, sessionId, input, parentTrace),
      ),
    );
  }

  private async executeAgent(
    agent: Agent,
    sessionId: string,
    input: AgentInput,
    parentTrace: ReturnType<typeof createTraceContext>,
  ): Promise<SessionEndEvent["agentResults"][number]> {
    const span = childSpan(parentTrace);
    const start = Date.now();

    // Start event
    const startEvent: AgentStartEvent = {
      id: createEventId(),
      type: EVENT_TYPES.AGENT_START,
      timestamp: Date.now(),
      sessionId,
      agentId: agent.id,
      taskId: input.taskId,
    };
    agentEventBus.emit(startEvent);

    logger.info("Agent executing", { trace: span, agentId: agent.id, taskId: input.taskId });

    try {
      const result = await agent.execute(input);

      // Emit progress at midpoint
      const progressEvent: AgentProgressEvent = {
        id: createEventId(),
        type: EVENT_TYPES.AGENT_PROGRESS,
        timestamp: Date.now(),
        sessionId,
        agentId: agent.id,
        taskId: input.taskId,
        progress: 100,
        message: result.success ? "Complete" : "Failed",
      };
      agentEventBus.emit(progressEvent);

      // Emit individual log lines
      for (const log of result.logs) {
        const logEvent: AgentLogEvent = {
          id: createEventId(),
          type: EVENT_TYPES.AGENT_LOG,
          timestamp: Date.now(),
          sessionId,
          agentId: agent.id,
          taskId: input.taskId,
          message: log,
          level: "info",
        };
        agentEventBus.emit(logEvent);
      }

      const durationMs = Date.now() - start;

      // Complete event
      const completeEvent: AgentCompleteEvent = {
        id: createEventId(),
        type: EVENT_TYPES.AGENT_COMPLETE,
        timestamp: Date.now(),
        sessionId,
        agentId: agent.id,
        taskId: input.taskId,
        durationMs,
        success: result.success,
        data: result.data,
      };
      agentEventBus.emit(completeEvent);

      logger.info("Agent finished", {
        trace: span,
        agentId: agent.id,
        taskId: input.taskId,
        durationMs,
      });

      return { agentId: agent.id, success: result.success, durationMs };
    } catch (err) {
      const durationMs = Date.now() - start;

      const errorEvent: AgentErrorEvent = {
        id: createEventId(),
        type: EVENT_TYPES.AGENT_ERROR,
        timestamp: Date.now(),
        sessionId,
        agentId: agent.id,
        taskId: input.taskId,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      };
      agentEventBus.emit(errorEvent);

      logger.error(`Agent failed: ${err instanceof Error ? err.message : String(err)}`, {
        trace: span,
        agentId: agent.id,
        taskId: input.taskId,
        durationMs,
      });

      return { agentId: agent.id, success: false, durationMs };
    }
  }
}
