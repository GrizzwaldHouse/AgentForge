import type { WorkflowDefinition, WorkflowRun } from "@/workflows/types";

export interface WorkflowBackend {
  executeWorkflow(def: WorkflowDefinition): Promise<WorkflowRun>;
  cancelWorkflow(runId: string): Promise<void>;
  getRunStatus(runId: string): Promise<WorkflowRun>;
}
