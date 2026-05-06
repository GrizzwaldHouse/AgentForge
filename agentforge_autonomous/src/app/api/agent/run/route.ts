import { NextRequest, NextResponse } from "next/server";
import { createAgents } from "@/agents/registry";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { SupervisorOrchestrator } from "@/orchestrator/SupervisorOrchestrator";
import { attachLoggingMiddleware } from "@/core/observability/event-middleware";
import { createBackend, type BackendConfig } from "@/backend/execution/ExecutionBackend";
import { ModelService } from "@/backend/services/ModelService";
import { getEnvConfig } from "@/config/env";

// Import backends to ensure registration
import "@/backend/execution/OllamaBackend";
import "@/backend/execution/SimulatedBackend";
import "@/backend/execution/ProviderChainBackend";

// Attach observability on module load
attachLoggingMiddleware();

// Shared ModelService instance (30s cache for model detection)
const modelService = new ModelService();

// Concurrency guard — cap simultaneous pipeline runs to protect the $1/day budget
let activePipelines = 0;
const MAX_CONCURRENT_PIPELINES = 2;

/** Remove internal prompt data before sending to callers. */
function scrubAgentData(result: unknown): unknown {
  if (result === null || typeof result !== "object") return result;
  if (Array.isArray(result)) return result.map(scrubAgentData);
  const obj = result as Record<string, unknown>;
  const scrubbed: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "prompt") continue;
    scrubbed[k] = scrubAgentData(v);
  }
  return scrubbed;
}

export async function POST(request: NextRequest) {
  // Auth: require shared secret when AGENT_TOKEN is configured
  const env = getEnvConfig();
  if (env.agentToken) {
    const provided = request.headers.get("x-agent-token");
    if (provided !== env.agentToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Concurrency guard
  if (activePipelines >= MAX_CONCURRENT_PIPELINES) {
    return NextResponse.json(
      { error: "Too many concurrent pipelines — try again shortly" },
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

  // Validate and sanitize taskId — alphanumeric + hyphens/underscores only
  let taskId = `task_${Date.now()}`;
  if ("taskId" in data && typeof data.taskId === "string") {
    const sanitized = data.taskId.trim();
    if (sanitized.length > 100) {
      return NextResponse.json(
        { error: "taskId exceeds maximum length of 100 characters" },
        { status: 400 }
      );
    }
    if (sanitized.length > 0 && !/^[\w\-]{1,100}$/.test(sanitized)) {
      return NextResponse.json(
        { error: "taskId may only contain letters, numbers, underscores, and hyphens" },
        { status: 400 }
      );
    }
    if (sanitized.length > 0) {
      taskId = sanitized;
    }
  }

  // Validate context object
  let context: Record<string, unknown> = {};
  if ("context" in data) {
    if (data.context != null && typeof data.context === "object" && !Array.isArray(data.context)) {
      context = data.context as Record<string, unknown>;
      // Guard against oversized context blowing up LLM prompts
      if (JSON.stringify(context).length > 50_000) {
        return NextResponse.json(
          { error: "context exceeds maximum size of 50,000 characters" },
          { status: 400 }
        );
      }
    } else if (data.context !== undefined && data.context !== null) {
      return NextResponse.json(
        { error: "context must be an object" },
        { status: 400 }
      );
    }
  }

  // Validate parallel flag
  let parallel = false;
  if ("parallel" in data) {
    if (typeof data.parallel !== "boolean") {
      return NextResponse.json(
        { error: "parallel must be a boolean" },
        { status: 400 }
      );
    }
    parallel = data.parallel;
  }

  // Validate backend mode
  const validBackends = ["auto", "ollama", "simulated", "provider-chain"];
  const backendMode = typeof data.backend === "string" && validBackends.includes(data.backend)
    ? data.backend
    : "auto";

  try {
    // Determine backend type based on mode
    let backendType: "ollama" | "simulated" | "provider-chain";

    if (backendMode === "auto") {
      const ollamaAvailable = await modelService.isAvailable();
      backendType = ollamaAvailable ? "ollama" : "simulated";
    } else if (backendMode === "ollama") {
      const ollamaAvailable = await modelService.isAvailable();
      if (!ollamaAvailable) {
        return NextResponse.json(
          { error: "Ollama backend requested but not available" },
          { status: 503 }
        );
      }
      backendType = "ollama";
    } else if (backendMode === "simulated") {
      backendType = "simulated";
    } else if (backendMode === "provider-chain") {
      backendType = "provider-chain";
    } else {
      return NextResponse.json(
        { error: `Invalid backend mode: ${backendMode}. Expected "auto", "ollama", "simulated", or "provider-chain"` },
        { status: 400 }
      );
    }

    // Use ModelService to recommend the best available model
    const recommendedModel = await modelService.recommend();

    // Create backend config — read Ollama URL from env, never hardcode
    // SimulatedBackend uses timeoutMs as its per-agent delay, so keep it short
    const backendConfig: BackendConfig = {
      type: backendType,
      timeoutMs: backendType === "simulated" ? 50 : 60_000,
      ollamaBaseUrl: env.ollamaBaseUrl,
      ollamaModel: recommendedModel,
    };

    // Create backend and agents
    const backend = createBackend(backendConfig);
    const agents = createAgents(backend);

    // Use supervisor mode for self-healing, or basic mode for simplicity
    const useSupervisor = data.supervisor === true;

    activePipelines++;
    try {
      let result: unknown;
      if (useSupervisor) {
        const supervisor = new SupervisorOrchestrator(agents, { parallel });
        result = await supervisor.run(taskId, context);
      } else {
        const orch = new ObservableOrchestrator(agents, { parallel });
        result = await orch.run(taskId, context);
      }
      // Strip assembled LLM prompts from the response — keep them server-side only
      return NextResponse.json(scrubAgentData(result));
    } finally {
      activePipelines--;
    }
  } catch (err) {
    // Log full error server-side, return generic message to client
    console.error("[POST /api/agent/run] Pipeline execution failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
