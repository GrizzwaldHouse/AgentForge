/**
 * Gmail webhook endpoint — receives Pub/Sub push notifications from Gmail Watch API.
 *
 * Pub/Sub push format:
 *   { message: { data: base64-encoded JSON, messageId, publishTime }, subscription }
 *
 * Flow:
 *   1. Parse & validate Pub/Sub envelope
 *   2. Decode and validate the Gmail message payload
 *   3. Run through safety layer (kill switch check)
 *   4. Execute Gmail agent pipeline: Classification -> Priority -> Response
 *   5. Return 200 immediately (Gmail retries on non-2xx)
 */

import { NextRequest, NextResponse } from "next/server";
import { createBackend, type BackendConfig } from "@/backend/execution/ExecutionBackend";
import {
  ClassificationAgent,
  PriorityAgent,
  GmailResponseAgent,
  type GmailMessage,
} from "@/agents/gmail";
import { killSwitch, auditLogger } from "@/safety";
import { sanitizeString } from "@/lib/sanitize";
import { ModelService } from "@/backend/services/ModelService";

// Import backends to ensure registration
import "@/backend/execution/OllamaBackend";
import "@/backend/execution/SimulatedBackend";
import "@/backend/execution/ProviderChainBackend";

const modelService = new ModelService();

// Max payload size guardrails
const MAX_SUBJECT_LENGTH = 500;
const MAX_BODY_LENGTH = 50_000;
const MAX_EMAIL_LENGTH = 320; // RFC 5321

interface PubSubEnvelope {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
}

function parsePubSubMessage(body: unknown): GmailMessage | null {
  if (!body || typeof body !== "object") return null;
  const envelope = body as PubSubEnvelope;

  if (!envelope.message?.data || typeof envelope.message.data !== "string") {
    return null;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(envelope.message.data, "base64").toString("utf-8");
  } catch {
    return null;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }

  return normalizeEmail(parsed);
}

function parseDirectMessage(body: unknown): GmailMessage | null {
  if (!body || typeof body !== "object") return null;
  return normalizeEmail(body as Record<string, unknown>);
}

function normalizeEmail(raw: Record<string, unknown>): GmailMessage | null {
  const messageId = typeof raw.messageId === "string" ? raw.messageId : null;
  const from = typeof raw.from === "string" ? raw.from : null;
  const subject = typeof raw.subject === "string" ? raw.subject : "";
  const body = typeof raw.body === "string" ? raw.body : "";

  if (!messageId || !from) return null;

  // Validate email length
  if (from.length > MAX_EMAIL_LENGTH) return null;

  // Normalize recipients
  let to: string[] = [];
  if (Array.isArray(raw.to)) {
    to = raw.to
      .filter((v): v is string => typeof v === "string")
      .filter((v) => v.length <= MAX_EMAIL_LENGTH)
      .slice(0, 50);
  } else if (typeof raw.to === "string") {
    to = [raw.to];
  }

  return {
    messageId: sanitizeString(messageId).slice(0, 200),
    threadId:
      typeof raw.threadId === "string"
        ? sanitizeString(raw.threadId).slice(0, 200)
        : messageId,
    from: sanitizeString(from),
    to,
    subject: sanitizeString(subject).slice(0, MAX_SUBJECT_LENGTH),
    body: sanitizeString(body).slice(0, MAX_BODY_LENGTH),
    timestamp:
      typeof raw.timestamp === "number" ? raw.timestamp : Date.now(),
    historyId:
      typeof raw.historyId === "string"
        ? sanitizeString(raw.historyId).slice(0, 100)
        : undefined,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Try Pub/Sub envelope first, fall back to direct message format
  const email = parsePubSubMessage(body) ?? parseDirectMessage(body);

  if (!email) {
    return NextResponse.json(
      { error: "Invalid email payload: missing messageId or from" },
      { status: 400 }
    );
  }

  // Kill switch check — if active, return 200 but skip processing
  // (Gmail retries non-2xx responses; we want to drop silently not retry-loop)
  if (killSwitch.isActive()) {
    auditLogger.log({
      actionId: `gmail-webhook-${email.messageId}`,
      actionType: "API_CALL",
      agentId: "gmail-webhook",
      status: "HALTED",
      reason: "Kill switch active",
    });
    return NextResponse.json(
      { status: "halted", messageId: email.messageId },
      { status: 200 }
    );
  }

  try {
    // Build backend (auto-detect Ollama, fall back to simulated)
    const ollamaAvailable = await modelService.isAvailable();
    const recommendedModel = await modelService.recommend();

    const backendConfig: BackendConfig = {
      type: ollamaAvailable ? "ollama" : "simulated",
      timeoutMs: 30_000,
      ollamaBaseUrl: "http://127.0.0.1:11434",
      ollamaModel: recommendedModel,
    };
    const backend = createBackend(backendConfig);

    // Create pipeline
    const classifier = new ClassificationAgent(backend);
    const prioritizer = new PriorityAgent(backend);
    const responder = new GmailResponseAgent(backend);

    const taskId = `gmail-${email.messageId}`;

    // Step 1: Classification
    const classificationResult = await classifier.execute({
      taskId,
      context: { email },
    });
    const classification = classificationResult.data?.classification;

    // Step 2: Priority (needs classification)
    const priorityResult = await prioritizer.execute({
      taskId,
      context: { email, classification },
    });
    const priority = priorityResult.data?.priority;

    // Step 3: Response (needs classification + priority)
    const responseResult = await responder.execute({
      taskId,
      context: { email, classification, priority },
    });

    auditLogger.log({
      actionId: `gmail-webhook-${email.messageId}`,
      actionType: "API_CALL",
      agentId: "gmail-webhook",
      status: "EXECUTED",
      details: {
        messageId: email.messageId,
        from: email.from,
        classification: classification?.labels,
        priority: priority?.priority,
        draftGenerated: !!responseResult.data?.draft,
        requiresApproval: !!responseResult.data?.safety?.requiresApproval,
      },
    });

    return NextResponse.json({
      status: "processed",
      messageId: email.messageId,
      classification,
      priority,
      draft: responseResult.data?.draft,
      safety: responseResult.data?.safety,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    auditLogger.log({
      actionId: `gmail-webhook-${email.messageId}`,
      actionType: "API_CALL",
      agentId: "gmail-webhook",
      status: "BLOCKED",
      reason: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
