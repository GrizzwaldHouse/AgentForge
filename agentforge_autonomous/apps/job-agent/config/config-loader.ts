import { readFileSync } from "fs";
import { join } from "path";

export interface PipelineConfig {
  batchSize: number;
  matchScoreThreshold: number;
  criticScoreThreshold: number;
  maxCriticRetries: number;
  logLevel: string;
}

export interface ModelConfig {
  proposalModel: string;
  criticModel: string;
  maxTokens: number;
  temperature: number;
}

export interface PathsConfig {
  outputsBase: string;
  matchesRaw: string;
  proposals: string;
  applications: string;
  jobSources: string;
  rejectionPatterns: string;
  coreMemory: string;
  proposalPrompt: string;
}

export interface SourcesConfig {
  phase1: string[];
  phase2: string[];
}

export interface BudgetConfig {
  dailyLimitUsd: number;
  maxCostPerProposal: number;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
}

export interface ResumeConfig {
  vaultPath: string;
  minMatchScore: number;
  vmockPassThreshold: number;
  maxIterations: number;
  authStatePath: string;
  screenshotDir: string;
  hfMatchModel: string;
  hfApiBase: string;
  vmockSelectors: {
    fileInput: string;
    jdTextarea: string;
    submitButton: string;
    scoreElement: string;
    feedbackItems: string;
  };
}

export interface JobAgentSettings {
  pipeline: PipelineConfig;
  model: ModelConfig;
  paths: PathsConfig;
  sources: SourcesConfig;
  budget: BudgetConfig;
  retry: RetryConfig;
  resume: ResumeConfig;
}

const REQUIRED_KEYS: Array<keyof JobAgentSettings> = [
  "pipeline",
  "model",
  "paths",
  "sources",
  "budget",
  "retry",
  "resume",
];

let cached: JobAgentSettings | null = null;

export function loadConfig(): JobAgentSettings {
  if (cached) return cached;

  const settingsPath = join(
    process.cwd(),
    "apps",
    "job-agent",
    "config",
    "settings.json"
  );

  let raw: string;
  try {
    raw = readFileSync(settingsPath, "utf-8");
  } catch {
    throw new Error(`[config-loader] Cannot read settings.json at ${settingsPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`[config-loader] settings.json is not valid JSON`);
  }

  const settings = parsed as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (!(key in settings) || settings[key] == null) {
      throw new Error(`[config-loader] Missing required config key: "${key}"`);
    }
  }

  cached = settings as unknown as JobAgentSettings;
  return cached;
}

export function resolveOutputPath(relativePath: string): string {
  return join(process.cwd(), relativePath);
}

export function resolveResumePath(vaultPath: string, filename: string): string {
  return join(vaultPath, filename);
}
