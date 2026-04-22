/**
 * GmailResponseAgent — generates a reply draft for a Gmail message.
 * Uses LLM backend if available, falls back to template response.
 * All drafts go through the safety layer before being considered "sent".
 */

import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { guardAction } from "@/safety";
import { extractBackendResponse } from "@/lib/response-parser";
import type {
  GmailMessage,
  ResponseDraft,
  PriorityResult,
  ClassificationResult,
} from "./types";

const SYSTEM_PROMPT = [
  "You are the GmailResponseAgent in a Gmail automation system.",
  "Given an email, generate a polite, concise draft reply.",
  "Do NOT send the email — this is only a draft for human review.",
  "Output a JSON object with:",
  '  "draft": the reply text (plain text, 2-5 sentences)',
  '  "tone": one of "formal" | "friendly" | "concise"',
  '  "suggestedSubject": optional new subject line',
].join("\n");

function templateResponse(email: GmailMessage): ResponseDraft {
  return {
    draft: `Hi,\n\nThanks for your message regarding "${email.subject}". I've received it and will review it and get back to you soon.\n\nBest regards`,
    tone: "friendly",
    suggestedSubject: email.subject.startsWith("Re:")
      ? email.subject
      : `Re: ${email.subject}`,
  };
}

export class GmailResponseAgent implements Agent {
  id = "gmail-response";
  name = "GmailResponseAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const email = input.context.email as GmailMessage | undefined;
    const classification = input.context.classification as
      | ClassificationResult
      | undefined;
    const priority = input.context.priority as PriorityResult | undefined;

    if (!email || typeof email !== "object") {
      logs.push("No email object in context");
      return {
        success: false,
        logs,
        data: { error: "Missing email in context" },
      };
    }

    // Skip draft generation for low-priority / promotional / spam
    if (
      priority?.priority === "low" ||
      classification?.labels.includes("spam") ||
      classification?.labels.includes("promotional") ||
      classification?.labels.includes("newsletter")
    ) {
      logs.push(`Skipping draft: ${priority?.priority ?? "low-value"} email`);
      return { success: true, logs, data: { draft: null, skipped: true } };
    }

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 70,
      humanMessage: `Drafting reply to ${email.from}`,
      stepName: "Response",
    });

    // Generate the draft (via LLM or template)
    let draft: ResponseDraft;
    if (!this.backend) {
      draft = templateResponse(email);
      logs.push("Generated template response (no backend)");
    } else {
      const prompt = `${SYSTEM_PROMPT}\n\nFrom: ${email.from}\nSubject: ${email.subject}\nBody:\n${email.body.slice(0, 2000)}`;

      try {
        const result = await this.backend.execute(
          { id: input.taskId, context: input.context },
          {
            taskId: input.taskId,
            context: { ...input.context, prompt },
          }
        );
        draft = this.parseResponse(
          extractBackendResponse(result.data),
          email
        );
        logs.push(...result.logs);
        logs.push(`Draft generated (${draft.draft.length} chars, ${draft.tone})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logs.push(`LLM drafting failed, using template: ${message}`);
        draft = templateResponse(email);
      }
    }

    // Route draft through safety layer — this gates any would-be send
    const guardResult = await guardAction({
      id: `gmail-draft-${email.messageId}-${Date.now()}`,
      type: "SEND_EMAIL",
      agentId: this.id,
      taskId: input.taskId,
      payload: {
        recipients: [email.from],
        body: draft.draft,
        subject: draft.suggestedSubject,
      },
      timestamp: Date.now(),
    });

    logs.push(
      `Safety guard: ${guardResult.allowed ? "ALLOWED" : guardResult.requiresApproval ? "APPROVAL_REQUIRED" : "BLOCKED"}`
    );

    agentEventBus.emit({
      id: createEventId(),
      type: EVENT_TYPES.AGENT_LOG,
      timestamp: Date.now(),
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      message: `Draft ready (${draft.draft.length} chars)`,
      level: "info",
      humanMessage: guardResult.requiresApproval
        ? "Draft ready — awaiting human approval"
        : `Draft ready for ${email.from}`,
    });

    return {
      success: true,
      logs,
      data: {
        draft,
        safety: {
          allowed: guardResult.allowed,
          requiresApproval: guardResult.requiresApproval ?? false,
          reason: guardResult.reason,
          actionId: guardResult.actionId,
        },
      },
    };
  }

  private parseResponse(raw: unknown, email: GmailMessage): ResponseDraft {
    let parsed: Record<string, unknown> = {};
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Treat raw string as the draft text itself
        return {
          draft: raw.slice(0, 2000),
          tone: "friendly",
          suggestedSubject: `Re: ${email.subject}`,
        };
      }
    } else if (raw && typeof raw === "object") {
      parsed = raw as Record<string, unknown>;
    }

    const draftText =
      typeof parsed.draft === "string" ? parsed.draft : templateResponse(email).draft;
    const rawTone = typeof parsed.tone === "string" ? parsed.tone : "friendly";
    const tone: ResponseDraft["tone"] =
      rawTone === "formal" || rawTone === "concise" ? rawTone : "friendly";

    return {
      draft: draftText.slice(0, 5000),
      tone,
      suggestedSubject:
        typeof parsed.suggestedSubject === "string"
          ? parsed.suggestedSubject
          : `Re: ${email.subject}`,
    };
  }
}
