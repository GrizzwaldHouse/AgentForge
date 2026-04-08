const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
const CACHE_TTL_MS = 30_000; // 30 seconds
const DEFAULT_MODEL = "llama3:8b";

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

export class ModelService {
  private cache: { models: string[]; timestamp: number } | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_OLLAMA_URL) {
    this.baseUrl = baseUrl;
  }

  async detect(): Promise<string[]> {
    // Check cache first
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp) < CACHE_TTL_MS) {
      return this.cache.models;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        return [];
      }

      const data: OllamaTagsResponse = await response.json();
      const models = data.models.map((m) => m.name);

      // Update cache
      this.cache = { models, timestamp: now };

      return models;
    } catch {
      // Ollama unavailable or timeout
      return [];
    }
  }

  async recommend(taskType?: string): Promise<string> {
    const models = await this.detect();

    if (models.length === 0) {
      return DEFAULT_MODEL;
    }

    // Task-specific recommendations
    if (taskType === "code") {
      const coderModel = models.find((m) => m.includes("qwen2.5-coder"));
      if (coderModel) return coderModel;
    }

    if (taskType === "plan") {
      const planModel = models.find((m) => m.includes("deepseek-r1"));
      if (planModel) return planModel;
    }

    // Return first available model
    return models[0];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2_000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
