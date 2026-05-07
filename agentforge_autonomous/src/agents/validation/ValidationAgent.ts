import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { emitProgress } from "@/agents/progress-helper";
import { workflowDefinitionSchema } from "@/workflows/schema";
import type { WorkflowDefinition, ValidationCheck, ValidationResult, ScrapeStep } from "@/workflows/types";

const MAX_STEPS_DEFAULT = 20;

function getMaxSteps(): number {
  const raw = process.env.WORKFLOW_MAX_STEPS;
  if (!raw) return MAX_STEPS_DEFAULT;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed <= 0 ? MAX_STEPS_DEFAULT : parsed;
}

function getAllowedScrapeHosts(): Set<string> {
  const raw = process.env.WORKFLOW_SCRAPE_ALLOWLIST ?? "";
  const hosts = raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set(hosts);
}

function getRequiredEnvVarsForStepType(stepType: string): string[] {
  const map: Record<string, string[]> = {
    scrape: [],
    filter: [],
    apply: [],
    store: [],
    notify: (process.env.WORKFLOW_NOTIFY_REQUIRED_VARS ?? "").split(",").map((v) => v.trim()).filter(Boolean),
  };
  return map[stepType] ?? [];
}

function checkCircularDeps(steps: WorkflowDefinition["steps"]): boolean {
  // Steps use string IDs; circular dependency = a step referencing a later step as a dependency
  // Since the DSL doesn't have explicit dep fields, we detect duplicate IDs as a proxy
  const seen = new Set<string>();
  for (const step of steps) {
    if (seen.has(step.id)) return true;
    seen.add(step.id);
  }
  return false;
}

export class ValidationAgent implements Agent {
  id = "validation";
  name = "ValidationAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const checks: ValidationCheck[] = [];

    const workflowDef = input.context.workflowDef as unknown;

    // Check 1: Schema validity
    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: "Validating workflow schema...",
      stepName: "Schema Check",
    });

    const schemaResult = workflowDefinitionSchema.safeParse(workflowDef);
    if (schemaResult.success) {
      checks.push({ name: "schema_validity", status: "pass", reason: "Workflow definition matches schema" });
      logs.push("Schema check passed");
    } else {
      const issues = schemaResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      checks.push({ name: "schema_validity", status: "fail", reason: `Schema invalid: ${issues}` });
      logs.push(`Schema check failed: ${issues}`);
      const result: ValidationResult = { passed: false, checks };
      return { success: true, logs, data: result };
    }

    const def = schemaResult.data as WorkflowDefinition;

    // Check 2: Step count limit
    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 30,
      humanMessage: "Checking step count...",
      stepName: "Step Count Check",
    });

    const maxSteps = getMaxSteps();
    if (def.steps.length <= maxSteps) {
      checks.push({ name: "step_count", status: "pass", reason: `${def.steps.length} steps (limit: ${maxSteps})` });
      logs.push(`Step count check passed: ${def.steps.length}/${maxSteps}`);
    } else {
      checks.push({ name: "step_count", status: "fail", reason: `${def.steps.length} steps exceeds limit of ${maxSteps}` });
      logs.push(`Step count check failed: ${def.steps.length} > ${maxSteps}`);
    }

    // Check 3: No unsafe URLs in scrape steps
    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 50,
      humanMessage: "Checking scrape URL allowlist...",
      stepName: "URL Safety Check",
    });

    const allowedHosts = getAllowedScrapeHosts();
    const scrapeSteps = def.steps.filter((s): s is ScrapeStep => s.type === "scrape");

    if (allowedHosts.size === 0) {
      checks.push({ name: "scrape_url_safety", status: "fail", reason: "WORKFLOW_SCRAPE_ALLOWLIST not configured — scrape steps blocked by default." });
      logs.push("URL safety check failed: no allowlist configured");
    } else {
      const unsafe: string[] = [];
      for (const step of scrapeSteps) {
        try {
          const host = new URL(step.source).hostname.toLowerCase();
          if (!allowedHosts.has(host)) unsafe.push(step.source);
        } catch {
          unsafe.push(step.source);
        }
      }
      if (unsafe.length === 0) {
        checks.push({ name: "scrape_url_safety", status: "pass", reason: "All scrape sources are on the allowlist" });
        logs.push("URL safety check passed");
      } else {
        checks.push({ name: "scrape_url_safety", status: "fail", reason: `Unsafe scrape sources: ${unsafe.join(", ")}` });
        logs.push(`URL safety check failed: ${unsafe.join(", ")}`);
      }
    }

    // Check 4: Required env vars per step type
    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 70,
      humanMessage: "Checking required environment variables...",
      stepName: "Env Var Check",
    });

    const missingVars: string[] = [];
    for (const step of def.steps) {
      const required = getRequiredEnvVarsForStepType(step.type);
      for (const varName of required) {
        if (!process.env[varName]) missingVars.push(`${varName} (required for ${step.type})`);
      }
    }

    if (missingVars.length === 0) {
      checks.push({ name: "env_vars", status: "pass", reason: "All required environment variables are present" });
      logs.push("Env var check passed");
    } else {
      checks.push({ name: "env_vars", status: "fail", reason: `Missing env vars: ${missingVars.join(", ")}` });
      logs.push(`Env var check failed: ${missingVars.join(", ")}`);
    }

    // Check 5: No circular step dependencies (duplicate IDs)
    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 90,
      humanMessage: "Checking for circular step dependencies...",
      stepName: "Dependency Check",
    });

    if (checkCircularDeps(def.steps)) {
      checks.push({ name: "circular_deps", status: "fail", reason: "Duplicate step IDs detected — possible circular dependency" });
      logs.push("Circular dep check failed: duplicate step IDs");
    } else {
      checks.push({ name: "circular_deps", status: "pass", reason: "No duplicate step IDs found" });
      logs.push("Circular dep check passed");
    }

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 100,
      humanMessage: "Validation complete",
      stepName: "Done",
    });

    const passed = checks.every((c) => c.status !== "fail");
    const result: ValidationResult = { passed, checks };
    logs.push(`Validation ${passed ? "passed" : "failed"} (${checks.filter((c) => c.status === "fail").length} failures)`);

    return { success: true, logs, data: result };
  }
}
