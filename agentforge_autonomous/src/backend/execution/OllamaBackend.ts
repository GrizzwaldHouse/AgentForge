import type { AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { Task } from "@/core/entities/Task";
import {
  type ExecutionBackend,
  type BackendConfig,
  type TaskStatus,
  ExecutionError,
  registerBackend,
} from "./ExecutionBackend";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "llama3:8b";
const DEFAULT_TIMEOUT_MS = 60_000;

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export class OllamaBackend implements ExecutionBackend {
  readonly type = "ollama" as const;
  private tasks = new Map<string, TaskStatus>();
  private abortControllers = new Map<string, AbortController>();
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: BackendConfig) {
    this.baseUrl = config.ollamaBaseUrl ?? DEFAULT_BASE_URL;
    this.model = config.ollamaModel ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async execute(task: Task, input: AgentInput): Promise<AgentOutput> {
    if (!task.id) {
      throw new ExecutionError("Task ID required", "INVALID_INPUT", "");
    }

    this.tasks.set(task.id, "running");
    const controller = new AbortController();
    this.abortControllers.set(task.id, controller);

    const logs: string[] = [];

    try {
      // Check Ollama availability
      const healthCheck = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5_000),
      }).catch(() => null);

      if (!healthCheck?.ok) {
        throw new ExecutionError(
          "Ollama is not reachable",
          "BACKEND_UNAVAILABLE",
          task.id,
        );
      }

      logs.push(`[ollama] Connected to ${this.baseUrl}, model: ${this.model}`);

      const prompt = this.buildPrompt(task, input);
      logs.push(`[ollama] Sending prompt (${prompt.length} chars)`);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(this.timeoutMs),
        ]),
      });

      if (!response.ok) {
        throw new ExecutionError(
          `Ollama returned ${response.status}: ${response.statusText}`,
          "EXECUTION_FAILED",
          task.id,
        );
      }

      const result: OllamaGenerateResponse = await response.json();
      logs.push(
        `[ollama] Response received (${result.eval_count ?? 0} tokens, ${result.total_duration ? Math.round(result.total_duration / 1e6) + "ms" : "unknown duration"})`,
      );

      this.tasks.set(task.id, "completed");
      this.abortControllers.delete(task.id);

      return {
        success: true,
        logs,
        data: {
          taskId: task.id,
          response: result.response,
          model: this.model,
          evalCount: result.eval_count,
        },
      };
    } catch (err) {
      this.abortControllers.delete(task.id);

      if (err instanceof ExecutionError) {
        this.tasks.set(task.id, "failed");
        throw err;
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        this.tasks.set(task.id, "cancelled");
        throw new ExecutionError("Request cancelled", "CANCELLED", task.id, err);
      }

      if (err instanceof DOMException && err.name === "TimeoutError") {
        this.tasks.set(task.id, "failed");
        throw new ExecutionError(
          `Ollama request timed out after ${this.timeoutMs}ms`,
          "TIMEOUT",
          task.id,
          err,
        );
      }

      this.tasks.set(task.id, "failed");
      throw new ExecutionError(
        `Ollama execution failed: ${err instanceof Error ? err.message : String(err)}`,
        "EXECUTION_FAILED",
        task.id,
        err,
      );
    }
  }

  cancel(taskId: string): void {
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.tasks.set(taskId, "cancelled");
      this.abortControllers.delete(taskId);
    }
  }

  status(taskId: string): TaskStatus {
    return this.tasks.get(taskId) ?? "pending";
  }

  private buildPrompt(task: Task, input: AgentInput): string {
    // Use the agent's constructed prompt if available (contains system prompt + task context)
    if (typeof input.context.prompt === "string") {
      return input.context.prompt;
    }

    // Fallback: generic prompt from raw context
    const contextStr = JSON.stringify(input.context, null, 2);
    return [
      `Task ID: ${task.id}`,
      `Context:`,
      contextStr,
      ``,
      `Execute the task described above. Return a structured JSON response.`,
    ].join("\n");
  }
}

// Self-register
registerBackend("ollama", (config) => new OllamaBackend(config));
