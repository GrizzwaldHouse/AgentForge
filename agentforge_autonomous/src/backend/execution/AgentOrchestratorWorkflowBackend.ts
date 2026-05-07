import { randomUUID } from "crypto";
import type { WorkflowDefinition, WorkflowRun, StepDef, StepRun, WorkflowStatus } from "@/workflows/types";
import type { WorkflowBackend } from "./WorkflowBackend";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { workflowStore } from "@/workflows/store";
import { allAgents } from "@/agents/registry";

const STEP_AGENT_MAP: Partial<Record<StepDef["type"], string>> = {
  scrape: "pipeline",
  apply: "builder",
  filter: "reviewer",
};

export class AgentOrchestratorWorkflowBackend implements WorkflowBackend {
  private runs = new Map<string, WorkflowRun>();

  constructor() {}

  async executeWorkflow(def: WorkflowDefinition): Promise<WorkflowRun> {
    const runId = randomUUID();
    const now = new Date().toISOString();

    const run: WorkflowRun = {
      id: runId,
      workflowId: def.id,
      status: "running",
      startedAt: now,
      steps: def.steps.map((step) => ({
        stepId: step.id,
        status: "pending" as WorkflowStatus,
        startedAt: now,
      })),
    };

    this.runs.set(runId, run);
    this.emitRunLog(runId, def.id, `Workflow run ${runId} started`, "info");

    // Execute each step sequentially, mapping to agents
    for (let i = 0; i < def.steps.length; i++) {
      const step = def.steps[i];
      run.steps[i] = { ...run.steps[i], status: "running", startedAt: new Date().toISOString() };

      try {
        await this.executeStep(def, step, runId);
        run.steps[i] = {
          ...run.steps[i],
          status: "completed",
          completedAt: new Date().toISOString(),
        };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        run.steps[i] = {
          ...run.steps[i],
          status: "failed",
          completedAt: new Date().toISOString(),
          error,
        };
        run.status = "failed";
        run.completedAt = new Date().toISOString();
        this.runs.set(runId, run);
        this.persistRun(def.id, run);
        this.emitRunLog(runId, def.id, `Step ${step.id} failed: ${error}`, "error");
        return run;
      }
    }

    run.status = "completed";
    run.completedAt = new Date().toISOString();
    this.runs.set(runId, run);
    this.persistRun(def.id, run);
    this.emitRunLog(runId, def.id, `Workflow run ${runId} completed`, "info");
    return run;
  }

  async cancelWorkflow(runId: string): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return;
    run.status = "failed";
    run.completedAt = new Date().toISOString();
    this.runs.set(runId, run);
    this.emitRunLog(runId, run.workflowId, `Workflow run ${runId} cancelled`, "warn");
  }

  async getRunStatus(runId: string): Promise<WorkflowRun> {
    const run = this.runs.get(runId);
    if (!run) {
      return {
        id: runId,
        workflowId: "unknown",
        status: "failed",
        startedAt: new Date().toISOString(),
        steps: [],
      };
    }
    return run;
  }

  private async executeStep(def: WorkflowDefinition, step: StepDef, runId: string): Promise<void> {
    const taskId = `wf_${runId}_${step.id}`;

    if (step.type === "store") {
      this.emitRunLog(runId, def.id, `Step ${step.id} (store): persisting data`, "info");
      return;
    }

    if (step.type === "notify") {
      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: runId,
        agentId: "workflow",
        taskId,
        message: `Notify via channel: ${step.channel}`,
        level: "info",
        humanMessage: `Workflow notification: ${step.channel}`,
      });
      return;
    }

    const agentId = STEP_AGENT_MAP[step.type];
    if (!agentId) return;

    const targetAgent = allAgents.find((a) => a.id === agentId);
    if (!targetAgent) return;

    const stepOrchestrator = new ObservableOrchestrator([targetAgent], { parallel: false });
    await stepOrchestrator.run(taskId, {
      workflowId: def.id,
      runId,
      step,
    });
  }

  private emitRunLog(
    runId: string,
    workflowId: string,
    message: string,
    level: "info" | "warn" | "error",
  ): void {
    agentEventBus.emit({
      id: createEventId(),
      type: EVENT_TYPES.AGENT_LOG,
      timestamp: Date.now(),
      sessionId: runId,
      agentId: "workflow",
      taskId: workflowId,
      message,
      level,
      humanMessage: message,
    });
  }

  private persistRun(workflowId: string, run: WorkflowRun): void {
    workflowStore.update(workflowId, { metadata: { latestRun: run } });
  }
}
