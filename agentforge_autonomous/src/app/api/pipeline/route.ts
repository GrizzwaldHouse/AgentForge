import { NextRequest, NextResponse } from "next/server";
import { getEnvConfig } from "@/config/env";
import { killSwitch } from "@/safety";
import { runPipelineCommand, type PipelineCommand } from "@/lib/pipeline-runner";

const VALID_COMMANDS: PipelineCommand[] = [
  "validate",
  "build",
  "sync",
  "full",
  "status",
  "dashboard-state",
];

// One pipeline run at a time — prevents overlapping pandoc/git processes
let pipelineRunning = false;

export async function POST(request: NextRequest) {
  // Auth: honour shared secret when AGENT_TOKEN is configured
  const env = getEnvConfig();
  if (env.agentToken) {
    const provided = request.headers.get("x-agent-token");
    if (provided !== env.agentToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Safety kill switch — consistent with /api/gmail/webhook pattern
  if (killSwitch.isActive()) {
    return NextResponse.json(
      { error: "Kill switch is active — pipeline execution blocked" },
      { status: 503 }
    );
  }

  // Concurrency guard
  if (pipelineRunning) {
    return NextResponse.json(
      { error: "A pipeline run is already in progress — try again shortly" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Validate command
  const command = data.command;
  if (typeof command !== "string" || !VALID_COMMANDS.includes(command as PipelineCommand)) {
    return NextResponse.json(
      { error: `command must be one of: ${VALID_COMMANDS.join(", ")}` },
      { status: 400 }
    );
  }

  // sync requires a commit message
  const extraArgs: string[] = [];
  if (command === "sync" || command === "full") {
    if (typeof data.message !== "string" || data.message.trim().length === 0) {
      return NextResponse.json(
        { error: `command "${command}" requires a non-empty "message" field` },
        { status: 400 }
      );
    }
    extraArgs.push("-m", data.message.trim());
  }

  pipelineRunning = true;
  try {
    const result = await runPipelineCommand(command as PipelineCommand, extraArgs);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/pipeline] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    pipelineRunning = false;
  }
}
