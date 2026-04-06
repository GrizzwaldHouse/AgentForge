import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";

const MAX_LOGS = 100;
const MAX_HISTORY = 20;
const MAX_CONTEXT_KEYS = 50;

export class ContextManagerAgent implements Agent {
  id = "context";
  name = "ContextManagerAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const ctx = input.context;

    // Prune logs — deduplicate and cap
    const prunedLogs = [...new Set(ctx.logs as string[] ?? [])].slice(-MAX_LOGS);
    const logsBefore = (ctx.logs as string[] ?? []).length;
    const logsAfter = prunedLogs.length;
    if (logsBefore > logsAfter) {
      logs.push(`Pruned logs: ${logsBefore} → ${logsAfter}`);
    }

    // Prune history — keep recent entries
    const history = (ctx.history as unknown[] ?? []).slice(-MAX_HISTORY);
    const histBefore = (ctx.history as unknown[] ?? []).length;
    if (histBefore > history.length) {
      logs.push(`Pruned history: ${histBefore} → ${history.length}`);
    }

    // Prune oversized context keys
    const pruned: Record<string, unknown> = {};
    const keys = Object.keys(ctx);
    const removedKeys: string[] = [];

    for (const key of keys.slice(0, MAX_CONTEXT_KEYS)) {
      const value = ctx[key];
      if (typeof value === "string" && value.length > 10_000) {
        pruned[key] = value.slice(0, 10_000) + "... [truncated]";
        removedKeys.push(key);
      } else {
        pruned[key] = value;
      }
    }

    if (keys.length > MAX_CONTEXT_KEYS) {
      logs.push(`Dropped ${keys.length - MAX_CONTEXT_KEYS} excess context keys`);
    }
    if (removedKeys.length > 0) {
      logs.push(`Truncated oversized keys: ${removedKeys.join(", ")}`);
    }

    pruned.logs = prunedLogs;
    pruned.history = history;

    const totalPruned = (logsBefore - logsAfter) + (histBefore - history.length) + removedKeys.length;
    logs.push(`Context managed: ${totalPruned} items pruned`);

    agentEventBus.emit({
      id: createEventId(),
      type: EVENT_TYPES.AGENT_LOG,
      timestamp: Date.now(),
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      message: `Context pruned: ${totalPruned} items`,
      level: "info",
    });

    return { success: true, logs, data: pruned };
  }
}
