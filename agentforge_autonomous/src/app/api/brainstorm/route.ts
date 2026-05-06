import { NextRequest, NextResponse } from "next/server";
import { BrainstormAgent } from "@/agents/brainstorm/BrainstormAgent";
import { killSwitch } from "@/safety/kill-switch";
import { getEnvConfig } from "@/config/env";

const MAX_DESCRIPTION_LENGTH = 2000;

export async function POST(request: NextRequest) {
  // Auth: require shared secret when AGENT_TOKEN is configured
  const env = getEnvConfig();
  if (env.agentToken) {
    const provided = request.headers.get("x-agent-token");
    if (provided !== env.agentToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Safety: kill switch check
  if (killSwitch.isActive()) {
    return NextResponse.json(
      { error: "System halted — kill switch is active" },
      { status: 503 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  // Validate projectDescription
  if (!("projectDescription" in data) || typeof data.projectDescription !== "string") {
    return NextResponse.json(
      { error: "projectDescription is required and must be a string" },
      { status: 400 }
    );
  }

  const projectDescription = (data.projectDescription as string).trim();

  if (projectDescription.length === 0) {
    return NextResponse.json(
      { error: "projectDescription must not be empty" },
      { status: 400 }
    );
  }

  if (projectDescription.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      {
        error: `projectDescription exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  // Optional theme
  const theme =
    "theme" in data && typeof data.theme === "string" && data.theme.trim() !== ""
      ? data.theme.trim()
      : undefined;

  // Execute agent
  try {
    const agent = new BrainstormAgent();
    const result = await agent.execute({
      taskId: "brainstorm",
      context: {
        projectDescription,
        ...(theme !== undefined ? { theme } : {}),
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.logs[0] ?? "Brainstorm execution failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err) {
    console.error("[POST /api/brainstorm] Execution error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
