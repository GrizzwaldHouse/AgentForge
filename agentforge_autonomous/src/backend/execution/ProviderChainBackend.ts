import type { AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { Task } from "@/core/entities/Task";
import {
  type ExecutionBackend,
  type BackendConfig,
  type TaskStatus,
  ExecutionError,
  registerBackend,
} from "./ExecutionBackend";
import { LLMProviderChain } from "../services/LLMProviderChain";

/**
 * ProviderChainBackend - Executes tasks using multi-provider fallback
 *
 * Implements ExecutionBackend by routing to LLMProviderChain
 */
export class ProviderChainBackend implements ExecutionBackend {
  readonly type = "provider-chain" as const;
  private tasks = new Map<string, TaskStatus>();
  private abortControllers = new Map<string, AbortController>();
  private readonly chain: LLMProviderChain;

  constructor(_config: BackendConfig) {
    // Initialize provider chain with defaults (Ollama → Groq → Cerebras)
    this.chain = new LLMProviderChain();
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
      // Build prompt from task and input
      const prompt = this.buildPrompt(task, input);
      logs.push(`[provider-chain] Built prompt (${prompt.length} chars)`);

      // Call provider chain
      const result = await this.chain.chat(prompt);

      logs.push(
        `[provider-chain] Response from ${result.provider} (${result.tokensUsed} tokens, ${result.latencyMs}ms)`
      );

      this.tasks.set(task.id, "completed");
      this.abortControllers.delete(task.id);

      return {
        success: true,
        logs,
        data: {
          taskId: task.id,
          response: result.response,
          provider: result.provider,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          latencyMs: result.latencyMs,
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

      this.tasks.set(task.id, "failed");
      throw new ExecutionError(
        `Provider chain execution failed: ${err instanceof Error ? err.message : String(err)}`,
        "EXECUTION_FAILED",
        task.id,
        err
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
    const contextStr = JSON.stringify(input.context, null, 2);
    return [
      `Task ID: ${task.id}`,
      `Context:`,
      contextStr,
      ``,
      `Execute the task described above. Return a structured response.`,
    ].join("\n");
  }
}

// Self-register
registerBackend("provider-chain", (config) => new ProviderChainBackend(config));
