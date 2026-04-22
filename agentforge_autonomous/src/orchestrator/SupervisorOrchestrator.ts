/**
 * SupervisorOrchestrator — Central intelligence layer.
 *
 * Replaces the simple ObservableOrchestrator as the top-level runner.
 * Adds:
 *   - Dynamic model routing per agent
 *   - Self-healing retry loops
 *   - Failure recovery with model switching
 *   - Structured event emission
 *
 * The ObservableOrchestrator is still used internally for sequential/parallel
 * execution, but the Supervisor wraps it with intelligence.
 */

import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { createTraceContext, childSpan } from "@/core/observability/trace";
import { logger } from "@/core/observability/logger";
import { guardAction } from "@/safety/safety-guard";
import { ModelRouter } from "@/routing/ModelRouter";
import { SelfHealingEngine } from "@/healing/SelfHealingEngine";
import { extractJSON, extractBackendResponse } from "@/lib/response-parser";
import type { RoutingConfig } from "@/routing/types";
import type { HealingConfig } from "@/healing/types";
import type {
  SessionStartEvent,
  SessionEndEvent,
  AgentStartEvent,
  AgentCompleteEvent,
  AgentErrorEvent,
} from "@/core/events/types";

export interface SupervisorConfig {
  parallel?: boolean;
  safetyEnabled?: boolean;
  routing?: Partial<RoutingConfig>;
  healing?: Partial<HealingConfig>;
}

export interface SupervisorResult {
  sessionId: string;
  taskId: string;
  traceId: string;
  totalDurationMs: number;
  agentResults: Array<{
    agentId: string;
    success: boolean;
    durationMs: number;
    healingAttempts: number;
    provider?: string;
  }>;
  healingSummary: {
    totalRetries: number;
    recoveredFailures: number;
    unrecoverableFailures: number;
  };
}

let sessionCounter = 0;

export class SupervisorOrchestrator {
  private readonly router: ModelRouter;
  private readonly healer: SelfHealingEngine;

  constructor(
    private readonly agents: Agent[],
    private readonly config: SupervisorConfig = {},
  ) {
    if (!agents || agents.length === 0) {
      throw new Error("SupervisorOrchestrator requires at least one agent");
    }
    this.router = new ModelRouter(config.routing);
    this.healer = new SelfHealingEngine(config.healing);
  }

  async run(taskId: string, context: Record<string, unknown>): Promise<SupervisorResult> {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("taskId must be a non-empty string");
    }
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      throw new Error("context must be a plain object");
    }

    const sessionId = `sup_${Date.now()}_${++sessionCounter}`;
    const trace = createTraceContext();
    const sessionStart = Date.now();

    logger.info("Supervisor orchestration starting", {
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
      humanMessage: `Supervisor starting pipeline with ${this.agents.length} agents...`,
    };
    agentEventBus.emit(startEvent);

    const input: AgentInput = { taskId, context };
    let agentResults: SupervisorResult["agentResults"];

    if (this.config.parallel) {
      agentResults = await Promise.all(
        this.agents.map((agent) => this.executeWithHealing(agent, sessionId, input, trace)),
      );
    } else {
      agentResults = [];
      for (const agent of this.agents) {
        const result = await this.executeWithHealing(agent, sessionId, input, trace);
        agentResults.push(result);
      }
    }

    const totalDurationMs = Date.now() - sessionStart;
    const succeeded = agentResults.filter((r) => r.success).length;
    const total = agentResults.length;
    const totalRetries = agentResults.reduce((s, r) => s + r.healingAttempts, 0);
    const recoveredFailures = agentResults.filter((r) => r.success && r.healingAttempts > 0).length;
    const unrecoverableFailures = agentResults.filter((r) => !r.success).length;

    // Session end event
    const endEvent: SessionEndEvent = {
      id: createEventId(),
      type: EVENT_TYPES.SESSION_END,
      timestamp: Date.now(),
      sessionId,
      totalDurationMs,
      agentResults: agentResults.map((r) => ({
        agentId: r.agentId,
        success: r.success,
        durationMs: r.durationMs,
      })),
      humanMessage: `Supervisor complete — ${succeeded}/${total} agents succeeded, ${totalRetries} retries, ${(totalDurationMs / 1000).toFixed(1)}s`,
    };
    agentEventBus.emit(endEvent);

    logger.info("Supervisor orchestration complete", {
      trace,
      taskId,
      durationMs: totalDurationMs,
      data: { succeeded, totalRetries, recoveredFailures, unrecoverableFailures },
    });

    return {
      sessionId,
      taskId,
      traceId: trace.traceId,
      totalDurationMs,
      agentResults,
      healingSummary: { totalRetries, recoveredFailures, unrecoverableFailures },
    };
  }

  /**
   * Execute a single agent with self-healing retry loop.
   */
  private async executeWithHealing(
    agent: Agent,
    sessionId: string,
    input: AgentInput,
    parentTrace: ReturnType<typeof createTraceContext>,
  ): Promise<SupervisorResult["agentResults"][number]> {
    const span = childSpan(parentTrace);
    const start = Date.now();
    const stepIndex = this.agents.findIndex((a) => a.id === agent.id);
    const stepName = agent.name.replace("Agent", "");
    let healingAttempts = 0;
    let usedProvider: string | undefined;

    // Start event
    const startEvent: AgentStartEvent = {
      id: createEventId(),
      type: EVENT_TYPES.AGENT_START,
      timestamp: Date.now(),
      sessionId,
      agentId: agent.id,
      taskId: input.taskId,
      humanMessage: `Starting ${agent.name}...`,
      stepName,
      stepIndex,
      totalSteps: this.agents.length,
    };
    agentEventBus.emit(startEvent);

    // Safety check
    if (this.config.safetyEnabled !== false) {
      const safetyResult = await guardAction({
        id: `${sessionId}_${agent.id}`,
        type: "AGENT_EXECUTE",
        agentId: agent.id,
        taskId: input.taskId,
        payload: { context: input.context },
        timestamp: Date.now(),
      });

      if (!safetyResult.allowed) {
        const blockedEvent: AgentErrorEvent = {
          id: createEventId(),
          type: EVENT_TYPES.AGENT_ERROR,
          timestamp: Date.now(),
          sessionId,
          agentId: agent.id,
          taskId: input.taskId,
          error: `Safety guard blocked: ${safetyResult.reason}`,
          humanMessage: `${agent.name} blocked by safety system: ${safetyResult.reason}`,
        };
        agentEventBus.emit(blockedEvent);
        return { agentId: agent.id, success: false, durationMs: Date.now() - start, healingAttempts: 0 };
      }
    }

    // Model routing
    const taskProfile = this.router.classifyTask(agent.id, input.context);
    const routing = this.router.selectModel(taskProfile);
    usedProvider = routing.provider;

    logger.info(`Routing ${agent.name} to ${routing.provider} (${routing.reason})`, {
      trace: span,
      agentId: agent.id,
    });

    // Execution with self-healing
    const maxAttempts = (this.healer as SelfHealingEngine) ? 3 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await agent.execute(input);

        if (result.success) {
          this.router.recordSuccess(routing.provider, Date.now() - start);

          const completeEvent: AgentCompleteEvent = {
            id: createEventId(),
            type: EVENT_TYPES.AGENT_COMPLETE,
            timestamp: Date.now(),
            sessionId,
            agentId: agent.id,
            taskId: input.taskId,
            durationMs: Date.now() - start,
            success: true,
            data: result.data,
            humanMessage: `${agent.name} complete${healingAttempts > 0 ? ` (recovered after ${healingAttempts} retries)` : ""} (${((Date.now() - start) / 1000).toFixed(1)}s)`,
            stepName,
          };
          agentEventBus.emit(completeEvent);

          return {
            agentId: agent.id,
            success: true,
            durationMs: Date.now() - start,
            healingAttempts,
            provider: usedProvider,
          };
        }

        // Agent returned success: false — analyze and retry
        healingAttempts++;
        const resultData = result.data !== null && typeof result.data === "object" && !Array.isArray(result.data)
          ? result.data as Record<string, unknown>
          : {};
        const analysis = this.healer.analyzeFailure(
          new Error(typeof resultData["error"] === "string" ? resultData["error"] : "Agent returned failure"),
          extractBackendResponse(result.data),
        );

        logger.warn(`Agent ${agent.name} failed (attempt ${attempt + 1}): ${analysis.message}`, {
          trace: span,
          agentId: agent.id,
        });

        if (!analysis.recoverable || attempt >= maxAttempts - 1) break;

        // Try model switching if strategy suggests it
        if (analysis.suggestedStrategy === "switch_model") {
          const fallbackRouting = this.router.fallback(routing.provider, taskProfile);
          if (fallbackRouting) {
            usedProvider = fallbackRouting.provider;
            logger.info(`Switching ${agent.name} to ${fallbackRouting.provider}`, {
              trace: span,
              agentId: agent.id,
            });
          }
        }
      } catch (err) {
        healingAttempts++;
        const analysis = this.healer.analyzeFailure(err);

        logger.error(`Agent ${agent.name} threw (attempt ${attempt + 1}): ${analysis.message}`, {
          trace: span,
          agentId: agent.id,
        });

        this.router.recordFailure(routing.provider);

        if (!analysis.recoverable || attempt >= maxAttempts - 1) {
          const errorEvent: AgentErrorEvent = {
            id: createEventId(),
            type: EVENT_TYPES.AGENT_ERROR,
            timestamp: Date.now(),
            sessionId,
            agentId: agent.id,
            taskId: input.taskId,
            error: analysis.message,
            stack: err instanceof Error ? err.stack : undefined,
            humanMessage: `${agent.name} failed after ${healingAttempts} attempts: ${analysis.message}`,
          };
          agentEventBus.emit(errorEvent);

          return {
            agentId: agent.id,
            success: false,
            durationMs: Date.now() - start,
            healingAttempts,
            provider: usedProvider,
          };
        }

        // Try fallback model
        const fallbackRouting = this.router.fallback(routing.provider, taskProfile);
        if (fallbackRouting) {
          usedProvider = fallbackRouting.provider;
        }
      }
    }

    // Exhausted all attempts
    const finalEvent: AgentErrorEvent = {
      id: createEventId(),
      type: EVENT_TYPES.AGENT_ERROR,
      timestamp: Date.now(),
      sessionId,
      agentId: agent.id,
      taskId: input.taskId,
      error: `Agent exhausted all ${maxAttempts} attempts`,
      humanMessage: `${agent.name} failed permanently after ${healingAttempts} healing attempts`,
    };
    agentEventBus.emit(finalEvent);

    return {
      agentId: agent.id,
      success: false,
      durationMs: Date.now() - start,
      healingAttempts,
      provider: usedProvider,
    };
  }

  /**
   * Get current provider health status.
   */
  getProviderHealth() {
    return this.router.getHealthStatus();
  }
}
