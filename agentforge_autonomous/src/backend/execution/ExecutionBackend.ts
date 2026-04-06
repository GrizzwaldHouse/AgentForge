import type { AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { Task } from "@/core/entities/Task";

// Typed error for execution failures
export class ExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: ExecutionErrorCode,
    public readonly taskId: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ExecutionError";
  }
}

export type ExecutionErrorCode =
  | "TIMEOUT"
  | "CANCELLED"
  | "BACKEND_UNAVAILABLE"
  | "INVALID_INPUT"
  | "EXECUTION_FAILED";

export type BackendType = "simulated" | "ollama" | "mock";

export type TaskStatus = "pending" | "running" | "completed" | "cancelled" | "failed";

export interface BackendConfig {
  type: BackendType;
  timeoutMs?: number;
  retryCount?: number;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export interface ExecutionBackend {
  readonly type: BackendType;
  execute(task: Task, input: AgentInput): Promise<AgentOutput>;
  cancel(taskId: string): void;
  status(taskId: string): TaskStatus;
}

// Factory for config-driven backend selection
export function createBackend(config: BackendConfig): ExecutionBackend {
  // Lazy import to avoid circular deps — callers use this factory
  // Implementations register themselves below
  const factory = backendFactories.get(config.type);
  if (!factory) {
    throw new ExecutionError(
      `Unknown backend type: ${config.type}`,
      "BACKEND_UNAVAILABLE",
      "",
    );
  }
  return factory(config);
}

type BackendFactory = (config: BackendConfig) => ExecutionBackend;
const backendFactories = new Map<BackendType, BackendFactory>();

export function registerBackend(type: BackendType, factory: BackendFactory): void {
  backendFactories.set(type, factory);
}
