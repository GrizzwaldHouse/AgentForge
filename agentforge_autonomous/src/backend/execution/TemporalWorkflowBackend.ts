import { randomUUID } from "crypto";
import type { WorkflowDefinition, WorkflowRun } from "@/workflows/types";
import type { WorkflowBackend } from "./WorkflowBackend";

export class TemporalWorkflowBackend implements WorkflowBackend {
  constructor(private config: { temporalAddress: string; namespace: string }) {}

  async executeWorkflow(def: WorkflowDefinition): Promise<WorkflowRun> {
    // TODO: connect to this.config.temporalAddress, start a Temporal workflow handle,
    // and map def.steps to Temporal activities registered under this.config.namespace.
    console.warn("[TemporalWorkflowBackend] Temporal backend not yet connected", {
      temporalAddress: this.config.temporalAddress,
      namespace: this.config.namespace,
      workflowId: def.id,
    });
    return this.pendingStub(def.id);
  }

  async cancelWorkflow(runId: string): Promise<void> {
    // TODO: obtain a workflow handle by runId and call handle.cancel().
    console.warn("[TemporalWorkflowBackend] Temporal backend not yet connected — cancel is a no-op", {
      runId,
    });
  }

  async getRunStatus(runId: string): Promise<WorkflowRun> {
    // TODO: obtain a workflow handle by runId, call handle.describe(), and map
    // WorkflowExecutionInfo.status to WorkflowStatus.
    console.warn("[TemporalWorkflowBackend] Temporal backend not yet connected — returning stub", {
      runId,
    });
    return this.pendingStub("unknown", runId);
  }

  private pendingStub(workflowId: string, runId?: string): WorkflowRun {
    return {
      id: runId ?? randomUUID(),
      workflowId,
      status: "pending",
      startedAt: new Date().toISOString(),
      steps: [],
    };
  }
}
