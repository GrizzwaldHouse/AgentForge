import { NextRequest, NextResponse } from "next/server";
import { workflowStore } from "@/workflows/store";
import { ValidationAgent } from "@/agents/validation/ValidationAgent";
import type { ValidationResult } from "@/workflows/types";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const workflow = workflowStore.get(id);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const agent = new ValidationAgent();
  const taskId = `validate_${id}_${Date.now()}`;

  try {
    const output = await agent.execute({ taskId, context: { workflowDef: workflow } });
    const result = output.data as ValidationResult;
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/workflows/[id]/validate] Validation failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
