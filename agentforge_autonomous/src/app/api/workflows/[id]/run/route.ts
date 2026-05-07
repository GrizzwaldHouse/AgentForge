import { NextRequest, NextResponse } from "next/server";
import { workflowStore } from "@/workflows/store";
import { ValidationAgent } from "@/agents/validation/ValidationAgent";
import { AgentOrchestratorWorkflowBackend } from "@/backend/execution/AgentOrchestratorWorkflowBackend";
import { TemporalWorkflowBackend } from "@/backend/execution/TemporalWorkflowBackend";
import { getEnvConfig } from "@/config/env";
import type { ValidationResult } from "@/workflows/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const workflow = workflowStore.get(id);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const data = (body !== null && typeof body === "object" && !Array.isArray(body))
    ? (body as Record<string, unknown>)
    : {};

  const backendParam = typeof data.backend === "string" ? data.backend : "orchestrator";
  const backendType = backendParam === "temporal" ? "temporal" : "orchestrator";

  const validationAgent = new ValidationAgent();
  const taskId = `validate_${id}_${Date.now()}`;
  const validationOutput = await validationAgent.execute({
    taskId,
    context: { workflowDef: workflow },
  });

  const validationResult = validationOutput.data as ValidationResult;

  if (!validationResult.passed) {
    return NextResponse.json(
      { error: "Workflow validation failed", checks: validationResult.checks },
      { status: 400 },
    );
  }

  try {
    if (backendType === "temporal") {
      const env = getEnvConfig();
      const backend = new TemporalWorkflowBackend({
        temporalAddress: env.temporalAddress,
        namespace: env.temporalNamespace,
      });
      const run = await backend.executeWorkflow(workflow);
      return NextResponse.json(run);
    }

    const backend = new AgentOrchestratorWorkflowBackend();
    const run = await backend.executeWorkflow(workflow);
    return NextResponse.json(run);
  } catch (err) {
    console.error("[POST /api/workflows/[id]/run] Execution failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
