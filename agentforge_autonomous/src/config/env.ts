/**
 * Typed environment configuration with fail-fast validation.
 *
 * All environment variables accessed through this module — never raw process.env.
 * Secrets are never logged; only presence/absence is reported.
 */

export interface EnvConfig {
  // Ollama (local, always available)
  ollamaBaseUrl: string;

  // Cloud LLM providers (optional — fallback chain)
  groqApiKey: string | undefined;
  cerebrasApiKey: string | undefined;
  togetherApiKey: string | undefined;
  mistralApiKey: string | undefined;

  // Paid fallback providers
  claudeApiKey: string | undefined;
  openaiApiKey: string | undefined;
  openrouterApiKey: string | undefined;

  // Auth
  agentToken: string | undefined;

  // Budget
  dailyBudgetUsd: number;

  // Runtime
  nodeEnv: string;
}

let cachedConfig: EnvConfig | null = null;

/**
 * Load and validate environment configuration.
 * Caches after first call. Throws on missing required vars.
 */
export function getEnvConfig(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const config: EnvConfig = {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    groqApiKey: process.env.GROQ_API_KEY || undefined,
    cerebrasApiKey: process.env.CEREBRAS_API_KEY || undefined,
    togetherApiKey: process.env.TOGETHER_API_KEY || undefined,
    mistralApiKey: process.env.MISTRAL_API_KEY || undefined,
    claudeApiKey: process.env.CLAUDE_API_KEY || undefined,
    openaiApiKey: process.env.OPENAI_API_KEY || undefined,
    openrouterApiKey: process.env.OPENROUTER_API_KEY || undefined,
    agentToken: process.env.AGENT_TOKEN || undefined,
    dailyBudgetUsd: parseFloat(process.env.DAILY_BUDGET_USD ?? "1.00"),
    nodeEnv: process.env.NODE_ENV ?? "development",
  };

  // Validate budget is a positive number
  if (isNaN(config.dailyBudgetUsd) || config.dailyBudgetUsd < 0) {
    throw new Error("DAILY_BUDGET_USD must be a non-negative number");
  }

  cachedConfig = config;
  return config;
}

/**
 * Get a safe summary of configured providers (for logging — no secrets).
 */
export function getProviderStatus(): Record<string, boolean> {
  const env = getEnvConfig();
  return {
    ollama: true, // always available (local)
    groq: !!env.groqApiKey,
    cerebras: !!env.cerebrasApiKey,
    together: !!env.togetherApiKey,
    mistral: !!env.mistralApiKey,
    claude: !!env.claudeApiKey,
    openai: !!env.openaiApiKey,
    openrouter: !!env.openrouterApiKey,
  };
}

/**
 * Reset cached config (for testing only).
 */
export function resetEnvCache(): void {
  cachedConfig = null;
}
