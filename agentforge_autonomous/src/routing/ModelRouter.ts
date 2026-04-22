/**
 * ModelRouter — Dynamic multi-model routing with health tracking.
 *
 * Strategies:
 *   - Task-based: code tasks → capable model, fast tasks → low-latency model
 *   - Cost-aware: free providers first, paid within budget
 *   - Health-aware: skip unhealthy providers, track consecutive failures
 *   - Latency-aware: prefer faster providers for simple tasks
 */

import { getEnvConfig } from "@/config/env";
import type {
  ProviderName,
  ProviderHealth,
  RoutingDecision,
  TaskProfile,
  TaskDomain,
  TaskComplexity,
  RoutingConfig,
} from "./types";
import { DEFAULT_ROUTING_CONFIG } from "./types";

interface ProviderSpec {
  name: ProviderName;
  model: string;
  costPerKToken: number;
  capabilities: TaskDomain[];
  maxTokens: number;
  priority: number; // lower = preferred
}

const PROVIDER_SPECS: ProviderSpec[] = [
  {
    name: "ollama",
    model: "llama3:8b",
    costPerKToken: 0,
    capabilities: ["code-generation", "code-review", "planning", "testing", "learning", "general"],
    maxTokens: 4096,
    priority: 1,
  },
  {
    name: "groq",
    model: "llama-3.3-70b-versatile",
    costPerKToken: 0,
    capabilities: ["code-generation", "code-review", "planning", "testing", "learning", "general"],
    maxTokens: 4096,
    priority: 2,
  },
  {
    name: "cerebras",
    model: "llama-3.3-70b",
    costPerKToken: 0,
    capabilities: ["code-generation", "planning", "general"],
    maxTokens: 4096,
    priority: 3,
  },
  {
    name: "together",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    costPerKToken: 0.0008,
    capabilities: ["code-generation", "code-review", "planning", "testing", "learning", "general"],
    maxTokens: 4096,
    priority: 4,
  },
  {
    name: "mistral",
    model: "mistral-small-latest",
    costPerKToken: 0,
    capabilities: ["code-generation", "planning", "general"],
    maxTokens: 4096,
    priority: 5,
  },
  {
    name: "claude",
    model: "claude-haiku-4-5-20251001",
    costPerKToken: 0.0008,
    capabilities: ["code-generation", "code-review", "planning", "testing", "learning", "general"],
    maxTokens: 4096,
    priority: 6,
  },
  {
    name: "openai",
    model: "gpt-4o-mini",
    costPerKToken: 0.00015,
    capabilities: ["code-generation", "code-review", "planning", "testing", "learning", "general"],
    maxTokens: 4096,
    priority: 7,
  },
];

// After this many ms without a success, reset consecutive failure count so the provider gets retried
const HEALTH_CHECK_TTL_MS = 30_000;
const MAX_CONSECUTIVE_FAILURES = 3;

export class ModelRouter {
  private healthMap = new Map<ProviderName, ProviderHealth>();
  private config: RoutingConfig;

  constructor(config?: Partial<RoutingConfig>) {
    this.config = { ...DEFAULT_ROUTING_CONFIG, ...config };
    this.initHealthMap();
  }

  private initHealthMap(): void {
    const env = getEnvConfig();
    const keyMap: Record<ProviderName, boolean> = {
      ollama: true, // always available locally
      groq: !!env.groqApiKey,
      cerebras: !!env.cerebrasApiKey,
      together: !!env.togetherApiKey,
      mistral: !!env.mistralApiKey,
      claude: !!env.claudeApiKey,
      openai: !!env.openaiApiKey,
    };

    for (const spec of PROVIDER_SPECS) {
      this.healthMap.set(spec.name, {
        name: spec.name,
        healthy: keyMap[spec.name],
        latencyMs: spec.name === "ollama" ? 100 : 500, // initial estimates
        lastCheckedAt: 0,
        consecutiveFailures: 0,
        hasApiKey: keyMap[spec.name],
      });
    }
  }

  /**
   * Select the best model for a given task profile.
   */
  selectModel(task: TaskProfile): RoutingDecision {
    const candidates = this.rankProviders(task);

    if (candidates.length === 0) {
      // Last resort — try ollama regardless
      return {
        provider: "ollama",
        model: "llama3:8b",
        reason: "No healthy providers available — falling back to Ollama",
        fallbacks: [],
      };
    }

    const primary = candidates[0];
    const fallbacks = candidates.slice(1).map((c) => c.name);

    return {
      provider: primary.name,
      model: this.getModelForProvider(primary.name),
      reason: this.explainChoice(primary, task),
      fallbacks,
    };
  }

  /**
   * Get fallback provider after a failure.
   */
  fallback(failedProvider: ProviderName, task: TaskProfile): RoutingDecision | null {
    this.recordFailure(failedProvider);

    const candidates = this.rankProviders(task).filter((c) => c.name !== failedProvider);

    if (candidates.length === 0) return null;

    const next = candidates[0];
    return {
      provider: next.name,
      model: this.getModelForProvider(next.name),
      reason: `Fallback after ${failedProvider} failure`,
      fallbacks: candidates.slice(1).map((c) => c.name),
    };
  }

  /**
   * Record a successful execution — improves health score.
   */
  recordSuccess(provider: ProviderName, latencyMs: number): void {
    const health = this.healthMap.get(provider);
    if (health) {
      health.healthy = true;
      health.latencyMs = latencyMs;
      health.lastCheckedAt = Date.now();
      health.consecutiveFailures = 0;
    }
  }

  /**
   * Record a failure — degrades health score.
   */
  recordFailure(provider: ProviderName): void {
    const health = this.healthMap.get(provider);
    if (health) {
      health.consecutiveFailures++;
      health.lastCheckedAt = Date.now();
      if (health.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        health.healthy = false;
      }
    }
  }

  /**
   * Get current health status for all providers.
   */
  getHealthStatus(): ProviderHealth[] {
    return Array.from(this.healthMap.values());
  }

  /**
   * Classify a task into a profile for routing decisions.
   */
  classifyTask(agentId: string, context: Record<string, unknown>): TaskProfile {
    const domainMap: Record<string, TaskDomain> = {
      planner: "planning",
      builder: "code-generation",
      reviewer: "code-review",
      tester: "testing",
      learning: "learning",
      context: "general",
    };

    const domain = domainMap[agentId] ?? "general";
    const contextSize = JSON.stringify(context).length;

    let complexity: TaskComplexity = "simple";
    if (contextSize > 5000) complexity = "complex";
    else if (contextSize > 1000) complexity = "moderate";

    return {
      domain,
      complexity,
      estimatedTokens: Math.min(contextSize * 2, 4096),
      requiresStructuredOutput: true,
    };
  }

  // --- Private ---

  private rankProviders(task: TaskProfile): ProviderSpec[] {
    const now = Date.now();
    return PROVIDER_SPECS
      .filter((spec) => {
        const health = this.healthMap.get(spec.name);
        if (!health) return false;
        if (!health.hasApiKey) return false;
        // Auto-recover providers that have been unhealthy past the TTL
        if (!health.healthy && health.lastCheckedAt > 0 && now - health.lastCheckedAt > HEALTH_CHECK_TTL_MS) {
          health.healthy = true;
          health.consecutiveFailures = 0;
        }
        if (!health.healthy) return false;
        if (!spec.capabilities.includes(task.domain)) return false;
        if (spec.costPerKToken > 0 && spec.costPerKToken * (task.estimatedTokens / 1000) > this.config.costCeiling) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Prefer local for simple tasks
        if (this.config.preferLocal && task.complexity === "simple") {
          if (a.name === "ollama") return -1;
          if (b.name === "ollama") return 1;
        }

        // Prefer lower latency for simple tasks
        if (task.complexity === "simple") {
          const aHealth = this.healthMap.get(a.name)!;
          const bHealth = this.healthMap.get(b.name)!;
          if (Math.abs(aHealth.latencyMs - bHealth.latencyMs) > 200) {
            return aHealth.latencyMs - bHealth.latencyMs;
          }
        }

        // Default: priority order (free-first)
        return a.priority - b.priority;
      });
  }

  private getModelForProvider(name: ProviderName): string {
    const spec = PROVIDER_SPECS.find((s) => s.name === name);
    return spec?.model ?? "unknown";
  }

  private explainChoice(spec: ProviderSpec, task: TaskProfile): string {
    const parts: string[] = [`Selected ${spec.name}`];
    if (spec.costPerKToken === 0) parts.push("(free)");
    if (spec.name === "ollama") parts.push("(local)");
    parts.push(`for ${task.domain} task`);
    parts.push(`(${task.complexity} complexity)`);
    return parts.join(" ");
  }
}
