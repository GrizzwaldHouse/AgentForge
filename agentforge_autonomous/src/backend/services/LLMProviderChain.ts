/**
 * LLMProviderChain - Multi-provider LLM fallback service
 *
 * TypeScript adaptation of BrightForge's UniversalLLMClient.
 * Implements free-first provider chain: Ollama → Groq → Cerebras → Together → Mistral → Claude → OpenAI
 *
 * @author Marcus Daley (GrizzwaldHouse)
 * @date April 6, 2026
 */

import { getEnvConfig } from "@/config/env";

export interface ProviderConfig {
  name: string;
  type: 'ollama' | 'groq' | 'cerebras' | 'together' | 'mistral' | 'claude' | 'openai';
  baseUrl: string;
  apiKey?: string;  // from env vars
  model: string;
  maxTokens: number;
  costPerToken?: number;  // for budget tracking (per 1k tokens)
  priority: number;  // lower = try first
}

export interface ProviderResult {
  provider: string;
  response: string;
  tokensUsed: number;
  cost: number;
  latencyMs: number;
}

interface HealthCheckCache {
  healthy: boolean;
  checkedAt: number;
}

interface DailyUsage {
  date: string;
  costUsd: number;
  requests: Record<string, number>;
  tokens: Record<string, number>;
}

/**
 * Multi-provider LLM client with automatic fallback and budget tracking
 */
export class LLMProviderChain {
  private providers: ProviderConfig[];
  private dailyBudget: number = 1.00;  // $1/day default
  private dailyUsage: DailyUsage;
  private healthCache: Map<string, HealthCheckCache>;
  private readonly HEALTH_CACHE_TTL_MS = 30_000;  // 30 seconds

  constructor(providers?: ProviderConfig[], dailyBudget?: number) {
    if (dailyBudget !== undefined) {
      this.dailyBudget = dailyBudget;
    }

    this.providers = providers ?? this.getDefaultProviders();
    this.healthCache = new Map();

    const today = new Date().toISOString().split('T')[0];
    this.dailyUsage = {
      date: today,
      costUsd: 0,
      requests: {},
      tokens: {}
    };
  }

  /**
   * Get default provider chain (free-tier priority, paid providers as last resort)
   */
  private getDefaultProviders(): ProviderConfig[] {
    const env = getEnvConfig();
    return [
      {
        name: 'ollama',
        type: 'ollama',
        baseUrl: env.ollamaBaseUrl,
        model: 'llama3:8b',
        maxTokens: 2048,
        costPerToken: 0,
        priority: 1
      },
      {
        name: 'groq',
        type: 'groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: env.groqApiKey,
        model: 'llama-3.3-70b-versatile',
        maxTokens: 2048,
        costPerToken: 0,
        priority: 2
      },
      {
        name: 'cerebras',
        type: 'cerebras',
        baseUrl: 'https://api.cerebras.ai/v1',
        apiKey: env.cerebrasApiKey,
        model: 'llama-3.3-70b',
        maxTokens: 2048,
        costPerToken: 0,
        priority: 3
      },
      {
        name: 'together',
        type: 'together',
        baseUrl: 'https://api.together.xyz/v1',
        apiKey: env.togetherApiKey,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        maxTokens: 2048,
        costPerToken: 0.0008,
        priority: 4
      },
      {
        name: 'mistral',
        type: 'mistral',
        baseUrl: 'https://api.mistral.ai/v1',
        apiKey: env.mistralApiKey,
        model: 'mistral-small-latest',
        maxTokens: 2048,
        costPerToken: 0,
        priority: 5
      },
      {
        name: 'claude',
        type: 'claude',
        baseUrl: 'https://api.anthropic.com/v1',
        apiKey: env.claudeApiKey,
        model: 'claude-haiku-4-5-20251001',
        maxTokens: 2048,
        costPerToken: 0.0008,
        priority: 6
      },
      {
        name: 'openai',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: env.openaiApiKey,
        model: 'gpt-4o-mini',
        maxTokens: 2048,
        costPerToken: 0.00015,
        priority: 7
      }
    ];
  }

  /**
   * Main chat method - tries providers in priority order
   *
   * @param prompt User prompt text
   * @param systemPrompt Optional system prompt for context
   * @returns Promise<ProviderResult> Response with metadata
   */
  async chat(prompt: string, systemPrompt?: string): Promise<ProviderResult> {
    this.resetDailyUsageIfNewDay();

    // Sort by priority
    const sortedProviders = [...this.providers].sort((a, b) => a.priority - b.priority);

    const errors: Array<{ provider: string; error: string }> = [];

    for (const config of sortedProviders) {
      // Skip if no API key (except Ollama which doesn't need one)
      if (config.type !== 'ollama' && !config.apiKey) {
        errors.push({ provider: config.name, error: 'No API key configured' });
        continue;
      }

      // Check health cache
      const isHealthy = await this.healthCheck(config);
      if (!isHealthy) {
        errors.push({ provider: config.name, error: 'Health check failed' });
        continue;
      }

      // Check budget
      if (this.dailyUsage.costUsd >= this.dailyBudget) {
        errors.push({ provider: config.name, error: 'Daily budget exceeded' });
        continue;
      }

      try {
        const result = await this.tryProvider(config, prompt, systemPrompt);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ provider: config.name, error: message });
        console.warn(`[LLMProviderChain] ${config.name} failed: ${message}`);
        continue;
      }
    }

    // All providers failed
    const errorMsg = `All LLM providers failed:\n${errors.map(e => `  - ${e.provider}: ${e.error}`).join('\n')}`;
    throw new Error(errorMsg);
  }

  /**
   * Try a specific provider
   */
  private async tryProvider(
    config: ProviderConfig,
    prompt: string,
    systemPrompt?: string
  ): Promise<ProviderResult> {
    const startTime = Date.now();

    console.log(`[LLMProviderChain] Trying ${config.name}...`);

    if (config.type === 'ollama') {
      return await this.callOllama(config, prompt, systemPrompt, startTime);
    } else if (config.type === 'claude') {
      return await this.callClaude(config, prompt, systemPrompt, startTime);
    } else {
      return await this.callOpenAICompatible(config, prompt, systemPrompt, startTime);
    }
  }

  /**
   * Call Ollama API (non-standard format)
   */
  private async callOllama(
    config: ProviderConfig,
    prompt: string,
    systemPrompt: string | undefined,
    startTime: number
  ): Promise<ProviderResult> {
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`
      : prompt;

    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: fullPrompt,
        stream: false
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    // Ollama response format: { response: string, done: boolean, eval_count?: number }
    const tokensUsed = data.eval_count ?? 0;
    const cost = 0;  // Ollama is free

    this.trackUsage(config.name, tokensUsed, cost);

    return {
      provider: config.name,
      response: data.response,
      tokensUsed,
      cost,
      latencyMs
    };
  }

  /**
   * Call Anthropic Claude API (distinct auth header and request format)
   */
  private async callClaude(
    config: ProviderConfig,
    prompt: string,
    systemPrompt: string | undefined,
    startTime: number
  ): Promise<ProviderResult> {
    const body: Record<string, unknown> = {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    };
    if (systemPrompt) body['system'] = systemPrompt;

    const response = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`claude returned ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      content: Array<{ text: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const latencyMs = Date.now() - startTime;
    const content = data.content?.[0]?.text ?? '';
    const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);
    const cost = config.costPerToken ? (tokensUsed / 1000) * config.costPerToken : 0;

    this.trackUsage(config.name, tokensUsed, cost);
    return { provider: config.name, response: content, tokensUsed, cost, latencyMs };
  }

  /**
   * Call OpenAI-compatible API (Groq, Cerebras, Together, Mistral, OpenAI)
   */
  private async callOpenAICompatible(
    config: ProviderConfig,
    prompt: string,
    systemPrompt: string | undefined,
    startTime: number
  ): Promise<ProviderResult> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.7,
        max_tokens: config.maxTokens
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${config.name} returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    // OpenAI-compatible response format
    const content = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage ?? { total_tokens: 0 };
    const tokensUsed = usage.total_tokens;

    // Calculate cost: (tokens / 1000) * costPerToken
    const cost = config.costPerToken
      ? (tokensUsed / 1000) * config.costPerToken
      : 0;

    this.trackUsage(config.name, tokensUsed, cost);

    return {
      provider: config.name,
      response: content,
      tokensUsed,
      cost,
      latencyMs
    };
  }

  /**
   * Health check with 30s caching
   */
  private async healthCheck(config: ProviderConfig): Promise<boolean> {
    const cached = this.healthCache.get(config.name);
    const now = Date.now();

    if (cached && (now - cached.checkedAt < this.HEALTH_CACHE_TTL_MS)) {
      return cached.healthy;
    }

    let healthy = false;

    try {
      if (config.type === 'ollama') {
        // Ollama: check /api/tags endpoint
        const response = await fetch(`${config.baseUrl}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(2_000)
        });
        healthy = response.ok;
      } else {
        // Cloud providers: assume healthy if API key exists
        healthy = !!config.apiKey;
      }
    } catch {
      healthy = false;
    }

    this.healthCache.set(config.name, { healthy, checkedAt: now });
    return healthy;
  }

  /**
   * Track usage for budget management
   */
  private trackUsage(provider: string, tokens: number, cost: number): void {
    this.dailyUsage.costUsd += cost;
    this.dailyUsage.requests[provider] = (this.dailyUsage.requests[provider] ?? 0) + 1;
    this.dailyUsage.tokens[provider] = (this.dailyUsage.tokens[provider] ?? 0) + tokens;
  }

  /**
   * Reset daily usage if new day
   */
  private resetDailyUsageIfNewDay(): void {
    const today = new Date().toISOString().split('T')[0];

    if (this.dailyUsage.date !== today) {
      this.dailyUsage = {
        date: today,
        costUsd: 0,
        requests: {},
        tokens: {}
      };
    }
  }

  /**
   * Get current daily spend
   */
  getDailySpend(): number {
    return this.dailyUsage.costUsd;
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    return Math.max(0, this.dailyBudget - this.dailyUsage.costUsd);
  }

  /**
   * Get usage summary
   */
  getUsageSummary(): DailyUsage & { budgetRemaining: number } {
    return {
      ...this.dailyUsage,
      budgetRemaining: this.getRemainingBudget()
    };
  }

  /**
   * Force reset daily spend (for testing)
   */
  resetDailySpend(): void {
    this.dailyUsage.costUsd = 0;
    this.dailyUsage.requests = {};
    this.dailyUsage.tokens = {};
  }
}
