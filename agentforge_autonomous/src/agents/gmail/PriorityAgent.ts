/**
 * PriorityAgent — assigns urgency priority to Gmail messages.
 * Uses LLM backend if available, falls back to heuristic scoring.
 */

import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import { extractBackendResponse } from "@/lib/response-parser";
import type {
  GmailMessage,
  PriorityResult,
  EmailPriority,
  ClassificationResult,
} from "./types";

const SYSTEM_PROMPT = [
  "You are the PriorityAgent in a Gmail automation system.",
  "Given an email and its classification, assign a priority level.",
  "Priority levels: urgent, high, normal, low",
  "Output a JSON object with:",
  '  "priority": one of "urgent" | "high" | "normal" | "low"',
  '  "score": number between 0 and 100',
  '  "reason": short explanation',
].join("\n");

const VALID_PRIORITIES: EmailPriority[] = ["urgent", "high", "normal", "low"];

function heuristicPrioritize(
  email: GmailMessage,
  classification?: ClassificationResult
): PriorityResult {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  let score = 50;
  const reasons: string[] = [];

  // Strong urgency signals
  if (/urgent|asap|emergency|critical/.test(text)) {
    score += 30;
    reasons.push("urgency keyword");
  }
  if (/deadline|due (today|tomorrow)/.test(text)) {
    score += 20;
    reasons.push("deadline mentioned");
  }

  // Classification signals
  if (classification?.labels.includes("important")) {
    score += 15;
    reasons.push("important label");
  }
  if (classification?.labels.includes("recruiter")) {
    score += 10;
    reasons.push("recruiter email");
  }

  // Negative signals
  if (classification?.labels.includes("newsletter")) {
    score -= 20;
    reasons.push("newsletter");
  }
  if (classification?.labels.includes("promotional")) {
    score -= 25;
    reasons.push("promotional");
  }
  if (classification?.labels.includes("spam")) {
    score -= 40;
    reasons.push("spam");
  }

  score = Math.min(100, Math.max(0, score));

  let priority: EmailPriority;
  if (score >= 80) priority = "urgent";
  else if (score >= 60) priority = "high";
  else if (score >= 30) priority = "normal";
  else priority = "low";

  return {
    priority,
    score,
    reason: reasons.length > 0 ? reasons.join(", ") : "default",
  };
}

export class PriorityAgent implements Agent {
  id = "gmail-priority";
  name = "PriorityAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const email = input.context.email as GmailMessage | undefined;
    const classification = input.context.classification as
      | ClassificationResult
      | undefined;

    if (!email || typeof email !== "object") {
      logs.push("No email object in context");
      return {
        success: false,
        logs,
        data: { error: "Missing email in context" },
      };
    }

    emitProgress({
      sessionId: "",
      agentId: this.id,
      taskId: input.taskId,
      progress: 40,
      humanMessage: `Prioritizing email from ${email.from}`,
      stepName: "Prioritization",
    });

    if (!this.backend) {
      const result = heuristicPrioritize(email, classification);
      logs.push(`Heuristic priority: ${result.priority} (score ${result.score})`);
      return { success: true, logs, data: { priority: result } };
    }

    const classificationHint = classification
      ? `\nClassification labels: ${classification.labels.join(", ")}`
      : "";
    const prompt = `${SYSTEM_PROMPT}\n\nFrom: ${email.from}\nSubject: ${email.subject}${classificationHint}\nBody:\n${email.body.slice(0, 2000)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    try {
      const result = await this.backend.execute(
        { id: input.taskId, context: input.context },
        {
          taskId: input.taskId,
          context: { ...input.context, prompt },
        }
      );

      const parsed = this.parseResponse(extractBackendResponse(result.data));
      logs.push(...result.logs);
      logs.push(`Priority: ${parsed.priority} (${parsed.score})`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Priority assigned: ${parsed.priority}`,
        level: "info",
        humanMessage: `Priority: ${parsed.priority} — ${parsed.reason}`,
      });

      return { success: true, logs, data: { priority: parsed } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`LLM prioritization failed, using heuristic: ${message}`);
      const fallback = heuristicPrioritize(email, classification);
      return { success: true, logs, data: { priority: fallback } };
    }
  }

  private parseResponse(raw: unknown): PriorityResult {
    let parsed: Record<string, unknown> = {};
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { priority: "normal", score: 50, reason: "parse failed" };
      }
    } else if (raw && typeof raw === "object") {
      parsed = raw as Record<string, unknown>;
    }

    const rawPriority =
      typeof parsed.priority === "string" ? parsed.priority.toLowerCase() : "normal";
    const priority = (VALID_PRIORITIES.includes(rawPriority as EmailPriority)
      ? rawPriority
      : "normal") as EmailPriority;

    return {
      priority,
      score:
        typeof parsed.score === "number"
          ? Math.min(100, Math.max(0, parsed.score))
          : 50,
      reason: typeof parsed.reason === "string" ? parsed.reason : "no reason",
    };
  }
}
