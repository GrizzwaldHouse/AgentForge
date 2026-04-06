// Structured logger with levels and trace context

import type { TraceContext } from "./trace";

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  traceId?: string;
  spanId?: string;
  agentId?: string;
  taskId?: string;
  durationMs?: number;
  data?: Record<string, unknown>;
}

type LogSink = (entry: LogEntry) => void;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class StructuredLogger {
  private sinks: LogSink[] = [];
  private minLevel: LogLevel = "INFO";

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  addSink(sink: LogSink): void {
    this.sinks.push(sink);
  }

  log(
    level: LogLevel,
    message: string,
    context?: {
      trace?: TraceContext;
      agentId?: string;
      taskId?: string;
      durationMs?: number;
      data?: Record<string, unknown>;
    },
  ): void {
    if (LOG_LEVEL_PRIORITY[level] > LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      traceId: context?.trace?.traceId,
      spanId: context?.trace?.spanId,
      agentId: context?.agentId,
      taskId: context?.taskId,
      durationMs: context?.durationMs,
      data: context?.data,
    };

    for (const sink of this.sinks) {
      sink(entry);
    }
  }

  error(message: string, context?: Parameters<StructuredLogger["log"]>[2]): void {
    this.log("ERROR", message, context);
  }
  warn(message: string, context?: Parameters<StructuredLogger["log"]>[2]): void {
    this.log("WARN", message, context);
  }
  info(message: string, context?: Parameters<StructuredLogger["log"]>[2]): void {
    this.log("INFO", message, context);
  }
  debug(message: string, context?: Parameters<StructuredLogger["log"]>[2]): void {
    this.log("DEBUG", message, context);
  }
}

// Singleton
export const logger = new StructuredLogger();

// Default sink: console (transitions only, per rules)
logger.addSink((entry) => {
  const prefix = `[${entry.level}]${entry.traceId ? ` [${entry.traceId}]` : ""}${entry.agentId ? ` [${entry.agentId}]` : ""}`;
  const suffix = entry.durationMs != null ? ` (${entry.durationMs}ms)` : "";
  // eslint-disable-next-line no-console
  console.log(`${prefix} ${entry.message}${suffix}`);
});
