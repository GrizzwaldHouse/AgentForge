/**
 * SelfHealingEngine — Reflexion-based recovery system.
 *
 * Analyzes failures, selects recovery strategy, and retries with modifications.
 * Strategies (in order of aggressiveness):
 *   1. retry_same_model — transient errors, just retry
 *   2. prompt_repair — schema mismatch, inject stricter JSON constraints
 *   3. switch_model — model failure, try next provider
 *   4. task_decomposition — complex failure, break into subtasks
 *   5. escalate — unrecoverable, bubble up to user
 */

import { extractJSON } from "@/lib/response-parser";
import type {
  FailureCategory,
  FailureAnalysis,
  RecoveryStrategy,
  RecoveryAttempt,
  HealingResult,
  HealingConfig,
} from "./types";
import { DEFAULT_HEALING_CONFIG } from "./types";

export class SelfHealingEngine {
  private config: HealingConfig;

  constructor(config?: Partial<HealingConfig>) {
    this.config = { ...DEFAULT_HEALING_CONFIG, ...config };
  }

  /**
   * Analyze a failure and categorize it.
   */
  analyzeFailure(error: unknown, rawOutput?: unknown): FailureAnalysis {
    const message = error instanceof Error ? error.message : String(error);

    // Timeout
    if (message.includes("timeout") || message.includes("TIMEOUT") || message.includes("TimeoutError") || message.includes("timed out")) {
      return {
        category: "timeout",
        message,
        recoverable: true,
        suggestedStrategy: "retry_same_model",
      };
    }

    // Rate limit
    if (message.includes("429") || message.includes("rate limit") || message.includes("Rate limit")) {
      return {
        category: "rate_limit",
        message,
        recoverable: true,
        suggestedStrategy: "switch_model",
      };
    }

    // Provider error (5xx, connection refused)
    if (
      message.includes("503") || message.includes("502") || message.includes("500") ||
      message.includes("ECONNREFUSED") || message.includes("not reachable") ||
      message.includes("BACKEND_UNAVAILABLE")
    ) {
      return {
        category: "provider_error",
        message,
        recoverable: true,
        suggestedStrategy: "switch_model",
      };
    }

    // Check for invalid JSON in raw output
    if (rawOutput !== undefined) {
      const parsed = extractJSON(rawOutput);
      if (!parsed && typeof rawOutput === "string" && rawOutput.trim().length > 0) {
        // LLM returned text but not valid JSON
        return {
          category: "invalid_json",
          message: "LLM response did not contain valid JSON",
          recoverable: true,
          suggestedStrategy: "prompt_repair",
          details: { rawLength: rawOutput.length, preview: String(rawOutput).slice(0, 100) },
        };
      }
    }

    // Truncated response
    if (message.includes("truncat") || (typeof rawOutput === "string" && rawOutput.endsWith("..."))) {
      return {
        category: "truncated_response",
        message: "Response appears truncated",
        recoverable: true,
        suggestedStrategy: "retry_same_model",
      };
    }

    // Unknown — still worth one retry before escalating
    return {
      category: "unknown",
      message,
      recoverable: true,
      suggestedStrategy: "retry_same_model",
    };
  }

  /**
   * Decide which recovery strategy to use based on failure history.
   */
  decideStrategy(analysis: FailureAnalysis, previousAttempts: RecoveryAttempt[]): RecoveryStrategy {
    const attemptCount = previousAttempts.length;

    // If we've already tried the suggested strategy and it failed, escalate
    const triedStrategies = new Set(previousAttempts.map((a) => a.strategy));

    // First attempt — use suggested strategy
    if (attemptCount === 0) {
      return analysis.suggestedStrategy;
    }

    // Already tried retry — escalate to model switch or prompt repair
    if (triedStrategies.has("retry_same_model") && !triedStrategies.has("prompt_repair")) {
      if (this.config.enablePromptRepair && analysis.category === "invalid_json") {
        return "prompt_repair";
      }
    }

    if (triedStrategies.has("retry_same_model") && !triedStrategies.has("switch_model")) {
      if (this.config.enableModelSwitching) {
        return "switch_model";
      }
    }

    // Exhausted retries
    if (attemptCount >= this.config.maxRetries) {
      return "escalate";
    }

    // Default: retry same model one more time
    return "retry_same_model";
  }

  /**
   * Generate a repaired prompt with stricter JSON constraints.
   */
  repairPrompt(originalPrompt: string, failureAnalysis: FailureAnalysis): string {
    const repair = [
      "CRITICAL: Your previous response was not valid JSON.",
      `Error: ${failureAnalysis.message}`,
      "",
      "RULES:",
      "1. Respond with ONLY a JSON object — no text before or after",
      "2. Do NOT use markdown code fences",
      "3. Ensure all strings are properly quoted",
      "4. Ensure all arrays and objects are properly closed",
      "5. Do NOT include comments in the JSON",
      "",
      "Try again:",
      "",
    ].join("\n");

    return repair + originalPrompt;
  }

  /**
   * Execute a healing loop — retry with progressive strategies.
   */
  async executeHealingLoop(
    executeFn: (prompt: string) => Promise<{ output: unknown; raw: string }>,
    originalPrompt: string,
    validateFn: (output: unknown) => boolean,
  ): Promise<HealingResult> {
    const attempts: RecoveryAttempt[] = [];
    const failures: FailureAnalysis[] = [];
    let currentPrompt = originalPrompt;
    let finalOutput: unknown = null;

    for (let i = 0; i < this.config.maxRetries; i++) {
      const start = Date.now();

      try {
        const { output, raw } = await executeFn(currentPrompt);

        if (validateFn(output)) {
          attempts.push({
            strategy: i === 0 ? "retry_same_model" : attempts[i - 1]?.strategy ?? "retry_same_model",
            attemptNumber: i + 1,
            success: true,
            durationMs: Date.now() - start,
          });

          return {
            recovered: true,
            totalAttempts: i + 1,
            strategies: attempts,
            finalOutput: output,
            failureChain: failures,
          };
        }

        // Valid execution but invalid output — analyze
        const analysis = this.analyzeFailure(new Error("Schema validation failed"), raw);
        failures.push(analysis);
        const strategy = this.decideStrategy(analysis, attempts);

        attempts.push({
          strategy,
          attemptNumber: i + 1,
          success: false,
          durationMs: Date.now() - start,
          error: analysis.message,
        });

        // Apply strategy
        if (strategy === "prompt_repair") {
          currentPrompt = this.repairPrompt(originalPrompt, analysis);
        } else if (strategy === "escalate") {
          finalOutput = output;
          break;
        }

        // Delay before retry
        if (this.config.retryDelayMs > 0) {
          await new Promise((r) => setTimeout(r, this.config.retryDelayMs));
        }
      } catch (err) {
        const analysis = this.analyzeFailure(err);
        failures.push(analysis);
        const strategy = this.decideStrategy(analysis, attempts);

        attempts.push({
          strategy,
          attemptNumber: i + 1,
          success: false,
          durationMs: Date.now() - start,
          error: analysis.message,
        });

        if (strategy === "escalate") break;

        if (strategy === "prompt_repair") {
          currentPrompt = this.repairPrompt(originalPrompt, analysis);
        }

        if (this.config.retryDelayMs > 0) {
          await new Promise((r) => setTimeout(r, this.config.retryDelayMs));
        }
      }
    }

    return {
      recovered: false,
      totalAttempts: attempts.length,
      strategies: attempts,
      finalOutput,
      failureChain: failures,
    };
  }
}
