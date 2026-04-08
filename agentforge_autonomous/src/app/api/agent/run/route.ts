import { NextRequest, NextResponse } from "next/server";
import { createAgents } from "@/agents/registry";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { attachLoggingMiddleware } from "@/core/observability/event-middleware";
import { createBackend, type BackendConfig } from "@/backend/execution/ExecutionBackend";
import { ModelService } from "@/backend/services/ModelService";

// Import backends to ensure registration
import "@/backend/execution/OllamaBackend";
import "@/backend/execution/SimulatedBackend";
import "@/backend/execution/ProviderChainBackend";

// Attach observability on module load
attachLoggingMiddleware();

// Shared ModelService instance (30s cache for model detection)
const modelService = new ModelService();

export async function POST(request: NextRequest) {
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

  // Validate and sanitize taskId
  let taskId = `task_${Date.now()}`;
  if ("taskId" in data && typeof data.taskId === "string") {
    const sanitized = data.taskId.trim();
    if (sanitized.length > 100) {
      return NextResponse.json(
        { error: "taskId exceeds maximum length of 100 characters" },
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

    // Create backend config
    const backendConfig: BackendConfig = {
      type: backendType,
      timeoutMs: 60_000,
      ollamaBaseUrl: "http://127.0.0.1:11434",
      ollamaModel: recommendedModel,
    };

    // Create backend and agents
    const backend = createBackend(backendConfig);
    const agents = createAgents(backend);

    // Create orchestrator with agents that have the backend
    const orch = new ObservableOrchestrator(agents, { parallel });

    const result = await orch.run(taskId, context);
    return NextResponse.json(result);
  } catch (err) {
    // Log full error server-side, return generic message to client
    console.error("[POST /api/agent/run] Pipeline execution failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
