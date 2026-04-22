/**
 * Typed output schemas for each agent.
 * These define the structured JSON each agent is expected to produce.
 */

// --- PlannerAgent ---
export interface PlanStep {
  id: number;
  action: string;
  details: string;
}

export interface PlannerOutput {
  steps: PlanStep[];
  summary: string;
  estimatedFiles: string[];
}

export const PLANNER_DEFAULTS: PlannerOutput = {
  steps: [],
  summary: "No plan generated",
  estimatedFiles: [],
};

export const PLANNER_REQUIRED: (keyof PlannerOutput)[] = ["steps", "summary"];

// --- BuilderAgent ---
export interface BuildFile {
  path: string;
  content: string;
  action: "create" | "modify";
}

export interface BuilderOutput {
  files: BuildFile[];
  summary: string;
}

export const BUILDER_DEFAULTS: BuilderOutput = {
  files: [],
  summary: "No build output",
};

export const BUILDER_REQUIRED: (keyof BuilderOutput)[] = ["files", "summary"];

// --- ReviewerAgent ---
export interface ReviewIssue {
  severity: "critical" | "warning" | "info";
  file: string;
  line: number;
  message: string;
}

export interface ReviewerOutput {
  issues: ReviewIssue[];
  approved: boolean;
  summary: string;
}

export const REVIEWER_DEFAULTS: ReviewerOutput = {
  issues: [],
  approved: true,
  summary: "No review performed",
};

export const REVIEWER_REQUIRED: (keyof ReviewerOutput)[] = ["issues", "approved", "summary"];

// --- TesterAgent ---
export interface TestCase {
  name: string;
  file: string;
  type: "unit" | "integration";
  code: string;
}

export interface TestCoverage {
  estimated: number;
  notes: string;
}

export interface TesterOutput {
  tests: TestCase[];
  coverage: TestCoverage;
  summary: string;
}

export const TESTER_DEFAULTS: TesterOutput = {
  tests: [],
  coverage: { estimated: 0, notes: "unknown" },
  summary: "No tests generated",
};

export const TESTER_REQUIRED: (keyof TesterOutput)[] = ["tests", "summary"];

// --- LearningAgent ---
export interface LearnedPattern {
  pattern: string;
  source: string;
  confidence: number;
}

export interface AntiPattern {
  pattern: string;
  reason: string;
}

export interface LearningOutput {
  patterns: LearnedPattern[];
  antiPatterns: AntiPattern[];
  recommendations: string[];
  summary: string;
}

export const LEARNING_DEFAULTS: LearningOutput = {
  patterns: [],
  antiPatterns: [],
  recommendations: [],
  summary: "No patterns extracted",
};

export const LEARNING_REQUIRED: (keyof LearningOutput)[] = ["patterns", "summary"];

// --- ContextManagerAgent ---
export interface ContextOutput {
  prunedKeys: string[];
  logsBefore: number;
  logsAfter: number;
  historyBefore: number;
  historyAfter: number;
  summary: string;
}

export const CONTEXT_DEFAULTS: ContextOutput = {
  prunedKeys: [],
  logsBefore: 0,
  logsAfter: 0,
  historyBefore: 0,
  historyAfter: 0,
  summary: "No context changes",
};
