/**
 * Self-healing system types.
 */

export type FailureCategory =
  | "invalid_json"
  | "schema_mismatch"
  | "timeout"
  | "provider_error"
  | "rate_limit"
  | "truncated_response"
  | "unknown";

export type RecoveryStrategy =
  | "retry_same_model"
  | "switch_model"
  | "prompt_repair"
  | "task_decomposition"
  | "escalate";

export interface FailureAnalysis {
  category: FailureCategory;
  message: string;
  recoverable: boolean;
  suggestedStrategy: RecoveryStrategy;
  details?: Record<string, unknown>;
}

export interface RecoveryAttempt {
  strategy: RecoveryStrategy;
  attemptNumber: number;
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface HealingResult {
  recovered: boolean;
  totalAttempts: number;
  strategies: RecoveryAttempt[];
  finalOutput: unknown;
  failureChain: FailureAnalysis[];
}

export interface HealingConfig {
  maxRetries: number;
  retryDelayMs: number;
  enablePromptRepair: boolean;
  enableModelSwitching: boolean;
  enableTaskDecomposition: boolean;
}

export const DEFAULT_HEALING_CONFIG: HealingConfig = {
  maxRetries: 3,
  retryDelayMs: 500,
  enablePromptRepair: true,
  enableModelSwitching: true,
  enableTaskDecomposition: false, // conservative default
};
