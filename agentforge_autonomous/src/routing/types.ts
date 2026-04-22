/**
 * Routing layer types — model selection, provider health, task classification.
 */

export type TaskComplexity = "simple" | "moderate" | "complex";

export type TaskDomain =
  | "code-generation"
  | "code-review"
  | "planning"
  | "testing"
  | "learning"
  | "general";

export interface TaskProfile {
  domain: TaskDomain;
  complexity: TaskComplexity;
  estimatedTokens: number;
  requiresStructuredOutput: boolean;
}

export type ProviderName = "ollama" | "groq" | "cerebras" | "together" | "mistral" | "claude" | "openai";

export interface ProviderHealth {
  name: ProviderName;
  healthy: boolean;
  latencyMs: number;
  lastCheckedAt: number;
  consecutiveFailures: number;
  hasApiKey: boolean;
}

export interface RoutingDecision {
  provider: ProviderName;
  model: string;
  reason: string;
  fallbacks: ProviderName[];
}

export type ExecutionMode = "single" | "fallback" | "parallel_consensus";

export interface RoutingConfig {
  mode: ExecutionMode;
  maxRetries: number;
  timeoutMs: number;
  preferLocal: boolean;
  costCeiling: number; // max cost per request in USD
}

export const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  mode: "fallback",
  maxRetries: 2,
  timeoutMs: 60_000,
  preferLocal: true,
  costCeiling: 0.05,
};
