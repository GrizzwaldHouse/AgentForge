/**
 * AutoDebugLoop — Continuous validation + correction loop.
 *
 * Flow: execute → validate → detect failure → repair → retry
 *
 * Uses SelfHealingEngine for recovery strategies and ModelRouter
 * for dynamic model switching on failures.
 */

import { extractJSON } from "@/lib/response-parser";
import { SelfHealingEngine } from "./SelfHealingEngine";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import type { HealingConfig } from "./types";
import { DEFAULT_HEALING_CONFIG } from "./types";

export interface DebugLoopResult {
  success: boolean;
  output: unknown;
  attempts: number;
  errors: string[];
  strategy: string;
}

export interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
}

/**
 * Validate output against a list of expected schema fields.
 */
export function validateSchema(output: unknown, fields: SchemaField[]): string[] {
  const errors: string[] = [];

  if (!output || typeof output !== "object" || Array.isArray(output)) {
    errors.push("Output is not a JSON object");
    return errors;
  }

  const obj = output as Record<string, unknown>;

  for (const field of fields) {
    const value = obj[field.name];

    if (field.required && (value === undefined || value === null)) {
      errors.push(`Missing required field: ${field.name}`);
      continue;
    }

    if (value === undefined || value === null) continue;

    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== field.type) {
      errors.push(`Field "${field.name}" expected ${field.type}, got ${actualType}`);
    }
  }

  return errors;
}

/**
 * Classify an error into an actionable debug category.
 */
export function classifyError(error: unknown): {
  category: string;
  actionable: boolean;
  suggestion: string;
} {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("JSON") || msg.includes("parse") || msg.includes("Unexpected token")) {
    return {
      category: "json_parse_error",
      actionable: true,
      suggestion: "Repair prompt with stricter JSON instructions",
    };
  }

  if (msg.includes("timeout") || msg.includes("TIMEOUT")) {
    return {
      category: "timeout",
      actionable: true,
      suggestion: "Retry with shorter prompt or switch to faster model",
    };
  }

  if (msg.includes("429") || msg.includes("rate")) {
    return {
      category: "rate_limit",
      actionable: true,
      suggestion: "Switch to alternative provider",
    };
  }

  if (msg.includes("Missing required field")) {
    return {
      category: "schema_mismatch",
      actionable: true,
      suggestion: "Inject field requirements into prompt",
    };
  }

  return {
    category: "unknown",
    actionable: false,
    suggestion: "Escalate to user",
  };
}

export class AutoDebugLoop {
  private healer: SelfHealingEngine;
  private config: HealingConfig;

  constructor(config?: Partial<HealingConfig>) {
    this.config = { ...DEFAULT_HEALING_CONFIG, ...config };
    this.healer = new SelfHealingEngine(this.config);
  }

  /**
   * Run the auto-debug loop for an agent execution.
   *
   * @param executeFn - Function that executes the agent and returns raw output
   * @param schema - Expected output schema fields
   * @param agentId - For event emission
   * @param taskId - For event emission
   */
  async run(
    executeFn: (prompt: string) => Promise<string>,
    originalPrompt: string,
    schema: SchemaField[],
    agentId: string,
    taskId: string,
  ): Promise<DebugLoopResult> {
    const errors: string[] = [];
    let attempts = 0;
    let currentPrompt = originalPrompt;
    let lastStrategy = "initial";

    for (let i = 0; i < this.config.maxRetries; i++) {
      attempts++;

      try {
        const raw = await executeFn(currentPrompt);
        const parsed = extractJSON(raw);

        if (!parsed) {
          const msg = "Failed to extract JSON from response";
          errors.push(msg);
          this.emitDebugEvent(agentId, taskId, msg, i + 1);

          // Repair prompt
          const analysis = this.healer.analyzeFailure(new Error(msg), raw);
          currentPrompt = this.healer.repairPrompt(originalPrompt, analysis);
          lastStrategy = "prompt_repair";
          continue;
        }

        // Validate schema
        const schemaErrors = validateSchema(parsed, schema);

        if (schemaErrors.length === 0) {
          // Success
          return {
            success: true,
            output: parsed,
            attempts,
            errors,
            strategy: lastStrategy,
          };
        }

        // Schema mismatch — try repair
        const msg = `Schema validation failed: ${schemaErrors.join(", ")}`;
        errors.push(msg);
        this.emitDebugEvent(agentId, taskId, msg, i + 1);

        const analysis = this.healer.analyzeFailure(new Error(msg), raw);
        currentPrompt = this.healer.repairPrompt(originalPrompt, analysis);
        lastStrategy = "prompt_repair";
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(msg);
        this.emitDebugEvent(agentId, taskId, msg, i + 1);

        const classification = classifyError(err);
        lastStrategy = classification.actionable ? "retry" : "escalate";

        if (!classification.actionable) break;
      }

      // Delay between retries
      if (this.config.retryDelayMs > 0 && i < this.config.maxRetries) {
        await new Promise((r) => setTimeout(r, this.config.retryDelayMs));
      }
    }

    return {
      success: false,
      output: null,
      attempts,
      errors,
      strategy: lastStrategy,
    };
  }

  private emitDebugEvent(agentId: string, taskId: string, message: string, attempt: number): void {
    agentEventBus.emit({
      id: createEventId(),
      type: EVENT_TYPES.AGENT_LOG,
      timestamp: Date.now(),
      sessionId: "",
      agentId,
      taskId,
      message: `[auto-debug] Attempt ${attempt}: ${message}`,
      level: "warn",
      humanMessage: `Auto-debug attempt ${attempt}: ${message}`,
    });
  }
}
