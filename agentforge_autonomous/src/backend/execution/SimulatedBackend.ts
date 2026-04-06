import type { AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { Task } from "@/core/entities/Task";
import {
  type ExecutionBackend,
  type BackendConfig,
  type TaskStatus,
  ExecutionError,
  registerBackend,
} from "./ExecutionBackend";

export class SimulatedBackend implements ExecutionBackend {
  readonly type = "simulated" as const;
  private tasks = new Map<string, TaskStatus>();
  private readonly delayMs: number;

  constructor(config: BackendConfig) {
    this.delayMs = config.timeoutMs ?? 50;
  }

  async execute(task: Task, input: AgentInput): Promise<AgentOutput> {
    if (!task.id) {
      throw new ExecutionError("Task ID required", "INVALID_INPUT", "");
    }

    this.tasks.set(task.id, "running");

    try {
      // Simulate async work with configurable delay
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));

      if (this.tasks.get(task.id) === "cancelled") {
        throw new ExecutionError(
          `Task ${task.id} was cancelled`,
          "CANCELLED",
          task.id,
        );
      }

      this.tasks.set(task.id, "completed");

      return {
        success: true,
        logs: [`[simulated] Executed task ${task.id}`],
        data: { taskId: task.id, context: input.context, simulated: true },
      };
    } catch (err) {
      if (err instanceof ExecutionError) throw err;

      this.tasks.set(task.id, "failed");
      throw new ExecutionError(
        `Simulated execution failed: ${err instanceof Error ? err.message : String(err)}`,
        "EXECUTION_FAILED",
        task.id,
        err,
      );
    }
  }

  cancel(taskId: string): void {
    if (this.tasks.get(taskId) === "running") {
      this.tasks.set(taskId, "cancelled");
    }
  }

  status(taskId: string): TaskStatus {
    return this.tasks.get(taskId) ?? "pending";
  }
}

// Self-register
registerBackend("simulated", (config) => new SimulatedBackend(config));
