import { NextRequest, NextResponse } from "next/server";
import { allAgents } from "@/agents/registry";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { attachLoggingMiddleware } from "@/core/observability/event-middleware";

// Attach observability on module load
attachLoggingMiddleware();

const orchestrator = new ObservableOrchestrator(allAgents);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const taskId = typeof body.taskId === "string" && body.taskId.trim().length > 0
    ? body.taskId
    : `task_${Date.now()}`;

  const context = body.context != null && typeof body.context === "object" && !Array.isArray(body.context)
    ? (body.context as Record<string, unknown>)
    : {};

  const parallel = body.parallel === true;

  try {
    const orch = parallel
      ? new ObservableOrchestrator(allAgents, { parallel: true })
      : orchestrator;

    const result = await orch.run(taskId, context);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
