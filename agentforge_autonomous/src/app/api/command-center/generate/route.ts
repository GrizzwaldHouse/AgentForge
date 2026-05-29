// route.ts
// Developer: Marcus Daley
// Date: 2026-05-13
// Purpose: Handles Command Center request-scoped LLM generation and SSE event delivery.

import { LLMProviderChain } from "@/backend/services/LLMProviderChain";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import type {
  AgentCompleteEvent,
  AgentLogEvent,
  AgentStartEvent,
} from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";

const COMMAND_CENTER_AGENT_ID = "command-center";
const DEFAULT_ERROR_SESSION_ID = "command-center-session-unavailable";
const DEFAULT_ERROR_TASK_ID = "command-center-task-unavailable";
const ROUTE_NAME = "/api/command-center/generate";
const SSE_CONTENT_TYPE = "text/event-stream";
const SSE_CACHE_CONTROL = "no-cache, no-transform";
const SSE_CONNECTION = "keep-alive";

const llmChain = new LLMProviderChain();

export const dynamic = "force-dynamic";

type CommandCenterRequest = {
  taskType: string;
  prompt: string;
  systemPrompt: string;
  sessionId: string;
  taskId: string;
};

class CommandCenterRouteError extends Error {
  readonly code: string;
  readonly statusCode: number;

  // Typed so the catch block can attach the right HTTP status and error code to the SSE frame
  // without inspecting the message string.
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "CommandCenterRouteError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// LLMProviderChain.chat() resolves the full response before returning, so all three lifecycle
// events (start, log, complete) are collected first and then flushed as a single closed SSE stream
// rather than keeping a long-lived connection open.
export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  let requestPayload: Partial<CommandCenterRequest> = {};

  try {
    requestPayload = await readCommandCenterRequest(request);
    const validatedPayload = validateCommandCenterRequest(requestPayload);

    console.info({
      route: ROUTE_NAME,
      transition: "agent_start",
      sessionId: validatedPayload.sessionId,
      taskId: validatedPayload.taskId,
      taskType: validatedPayload.taskType,
    });

    const startEvent = createStartEvent(validatedPayload, startTime);
    emitAgentEvent(startEvent);

    const result = await llmChain.chat(
      validatedPayload.prompt,
      validatedPayload.systemPrompt
    );

    console.info({
      route: ROUTE_NAME,
      transition: "provider_complete",
      sessionId: validatedPayload.sessionId,
      taskId: validatedPayload.taskId,
      provider: result.provider,
      latencyMs: result.latencyMs,
    });

    const logEvent = createProviderLogEvent(validatedPayload, result);
    const completeEvent = createCompleteEvent(validatedPayload, startTime, result);

    emitAgentEvent(logEvent);
    emitAgentEvent(completeEvent);

    return createSseResponse([startEvent, logEvent, completeEvent]);
  } catch (error: unknown) {
    const routeError = normalizeRouteError(error);
    const sessionId = readStringField(
      requestPayload,
      "sessionId",
      DEFAULT_ERROR_SESSION_ID
    );
    const taskId = readStringField(
      requestPayload,
      "taskId",
      DEFAULT_ERROR_TASK_ID
    );
    const errorEvent = createErrorLogEvent(sessionId, taskId, routeError);

    console.error({
      route: ROUTE_NAME,
      transition: "agent_error",
      sessionId,
      taskId,
      code: routeError.code,
      statusCode: routeError.statusCode,
      message: routeError.message,
    });

    emitAgentEvent(errorEvent);

    return createSseResponse([errorEvent], routeError.statusCode);
  }
}

// Parsing is isolated from validation so a malformed body produces a distinct 400 code
// rather than falling through to the generic provider-failure path.
async function readCommandCenterRequest(
  request: Request
): Promise<Partial<CommandCenterRequest>> {
  try {
    const body = (await request.json()) as unknown;

    if (!isRecord(body)) {
      throw new CommandCenterRouteError(
        "Command Center generation requires a JSON object body.",
        "INVALID_BODY",
        400
      );
    }

    return body as Partial<CommandCenterRequest>;
  } catch (error: unknown) {
    if (error instanceof CommandCenterRouteError) {
      throw error;
    }

    throw new CommandCenterRouteError(
      "Command Center generation received malformed JSON.",
      "MALFORMED_JSON",
      400
    );
  }
}

// Validation runs before any provider call so a missing sessionId or taskId never produces
// a BaseEvent with undefined fields, which would silently corrupt the event bus buffer.
function validateCommandCenterRequest(
  payload: Partial<CommandCenterRequest>
): CommandCenterRequest {
  const requiredTextFields: Array<keyof Omit<CommandCenterRequest, "systemPrompt">> = [
    "taskType",
    "prompt",
    "sessionId",
    "taskId",
  ];

  for (const field of requiredTextFields) {
    if (!isNonEmptyString(payload[field])) {
      throw new CommandCenterRouteError(
        `Command Center generation requires a non-empty ${field}.`,
        "INVALID_REQUEST_FIELD",
        400
      );
    }
  }

  if (typeof payload.systemPrompt !== "string") {
    throw new CommandCenterRouteError(
      "Command Center generation requires a systemPrompt string.",
      "INVALID_REQUEST_FIELD",
      400
    );
  }

  return payload as CommandCenterRequest;
}

// Uses the shared COMMAND_CENTER_AGENT_ID constant so UI components filtering by agentId
// don't need to hardcode a string that could drift between the route and the frontend.
function createStartEvent(
  payload: CommandCenterRequest,
  startTime: number
): AgentStartEvent {
  return {
    type: EVENT_TYPES.AGENT_START,
    id: createEventId(),
    timestamp: startTime,
    sessionId: payload.sessionId,
    agentId: COMMAND_CENTER_AGENT_ID,
    taskId: payload.taskId,
    humanMessage: `Command Center started ${payload.taskType}.`,
  };
}

// Logs which provider actually responded so budget debugging doesn't require server log triage
// when the chain falls through to a paid fallback.
function createProviderLogEvent(
  payload: CommandCenterRequest,
  result: Awaited<ReturnType<LLMProviderChain["chat"]>>
): AgentLogEvent {
  return {
    type: EVENT_TYPES.AGENT_LOG,
    id: createEventId(),
    timestamp: Date.now(),
    sessionId: payload.sessionId,
    agentId: COMMAND_CENTER_AGENT_ID,
    taskId: payload.taskId,
    message: `Provider ${result.provider} completed in ${result.latencyMs}ms.`,
    level: "info",
    humanMessage: `${result.provider} generated the response in ${result.latencyMs}ms.`,
  };
}

// Response text is carried in data.text rather than humanMessage because the narrative panel
// renders humanMessage as a status line, not a content area, and dumping a full LLM response
// there would overflow it.
function createCompleteEvent(
  payload: CommandCenterRequest,
  startTime: number,
  result: Awaited<ReturnType<LLMProviderChain["chat"]>>
): AgentCompleteEvent {
  return {
    type: EVENT_TYPES.AGENT_COMPLETE,
    id: createEventId(),
    timestamp: Date.now(),
    sessionId: payload.sessionId,
    agentId: COMMAND_CENTER_AGENT_ID,
    taskId: payload.taskId,
    durationMs: Date.now() - startTime,
    success: true,
    data: {
      text: result.response,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
    },
    humanMessage: "Command Center finished generating the response.",
  };
}

// Emitted to the shared bus even on failure so the dashboard activity feed reflects errors,
// not just successes. Silent failures would make the pipeline appear idle when it is broken.
function createErrorLogEvent(
  sessionId: string,
  taskId: string,
  error: CommandCenterRouteError
): AgentLogEvent {
  return {
    type: EVENT_TYPES.AGENT_LOG,
    id: createEventId(),
    timestamp: Date.now(),
    sessionId,
    agentId: COMMAND_CENTER_AGENT_ID,
    taskId,
    message: error.message,
    level: "error",
    humanMessage: `Command Center could not generate a response: ${error.message}`,
  };
}

// Thin wrapper ensures the same object reference goes to both the bus and the SSE frame,
// so subscribers and the HTTP client always see identical event data.
function emitAgentEvent(
  event: AgentStartEvent | AgentLogEvent | AgentCompleteEvent
): void {
  agentEventBus.emit(event);
}

// Events are collected before this is called so the SSE frame order always matches the agent
// lifecycle sequence regardless of how long each await took to resolve.
function createSseResponse(
  events: Array<AgentStartEvent | AgentLogEvent | AgentCompleteEvent>,
  status = 200
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    status,
    headers: {
      "Content-Type": SSE_CONTENT_TYPE,
      "Cache-Control": SSE_CACHE_CONTROL,
      Connection: SSE_CONNECTION,
    },
  });
}

// Provider failures map to 502 rather than 500 because the request itself was valid.
// The failure originated downstream at the LLM boundary, making it the gateway's responsibility.
function normalizeRouteError(error: unknown): CommandCenterRouteError {
  if (error instanceof CommandCenterRouteError) {
    return error;
  }

  if (error instanceof Error) {
    return new CommandCenterRouteError(
      error.message,
      "PROVIDER_CHAIN_FAILED",
      502
    );
  }

  return new CommandCenterRouteError(
    "Command Center generation failed for an unknown reason.",
    "UNKNOWN_GENERATION_FAILURE",
    500
  );
}

// Arrays pass typeof === "object" and null does too, so both are explicitly rejected.
// The route requires named fields that only a plain object can carry.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Trims before checking length so a payload of all whitespace doesn't pass as a valid prompt
// and produce a meaningless LLM call against the daily budget.
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// The catch block needs sessionId and taskId to emit a well-formed BaseEvent even when
// validation failed, avoiding undefined fields that would corrupt the event bus buffer on errors.
function readStringField(
  payload: Partial<CommandCenterRequest>,
  field: keyof CommandCenterRequest,
  fallback: string
): string {
  const value = payload[field];
  return isNonEmptyString(value) ? value : fallback;
}
