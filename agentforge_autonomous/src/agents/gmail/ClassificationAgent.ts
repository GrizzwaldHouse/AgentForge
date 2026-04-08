/**
 * ClassificationAgent — categorizes Gmail messages into labels.
 * Uses LLM backend if available, falls back to heuristic classification.
 */

import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";
import { emitProgress } from "@/agents/progress-helper";
import type {
  GmailMessage,
  ClassificationResult,
  EmailLabel,
} from "./types";

const SYSTEM_PROMPT = [
  "You are the ClassificationAgent in a Gmail automation system.",
  "Given an email, classify it with one or more labels from this set:",
  "  important, work, personal, promotional, spam, newsletter, social, transactional, recruiter",
  "Output a JSON object with:",
  '  "labels": array of label strings (lowercase, from the allowed set)',
  '  "confidence": number between 0 and 1',
  '  "summary": one-line summary of the email',
].join("\n");

const VALID_LABELS: EmailLabel[] = [
  "important",
  "work",
  "personal",
  "promotional",
  "spam",
  "newsletter",
  "social",
  "transactional",
  "recruiter",
];

function heuristicClassify(email: GmailMessage): ClassificationResult {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  const labels: EmailLabel[] = [];

  if (/unsubscribe|newsletter|digest/.test(text)) labels.push("newsletter");
  if (/invoice|receipt|payment|order #|confirmation/.test(text)) {
    labels.push("transactional");
  }
  if (/sale|discount|% off|limited time|deal/.test(text)) {
    labels.push("promotional");
  }
  if (/job|role|position|recruiter|opportunity|hiring/.test(text)) {
    labels.push("recruiter");
  }
  if (/urgent|asap|important|action required/.test(text)) {
    labels.push("important");
  }

  if (labels.length === 0) labels.push("personal");

  return {
    labels,
    confidence: 0.6,
    summary: email.subject.slice(0, 100),
  };
}

export class ClassificationAgent implements Agent {
  id = "gmail-classification";
  name = "ClassificationAgent";

  constructor(private backend?: ExecutionBackend) {}

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const email = input.context.email as GmailMessage | undefined;

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
      progress: 20,
      humanMessage: `Classifying email: ${email.subject?.slice(0, 60) ?? "(no subject)"}`,
      stepName: "Classification",
    });

    // Fallback path: no backend → heuristic
    if (!this.backend) {
      const result = heuristicClassify(email);
      logs.push(
        `Heuristic classification: ${result.labels.join(", ")} (${result.confidence})`
      );
      return { success: true, logs, data: { classification: result } };
    }

    const prompt = `${SYSTEM_PROMPT}\n\nFrom: ${email.from}\nSubject: ${email.subject}\nBody:\n${email.body.slice(0, 2000)}`;
    logs.push(`Prompt constructed (${prompt.length} chars)`);

    try {
      const result = await this.backend.execute(
        { id: input.taskId, context: input.context },
        {
          taskId: input.taskId,
          context: { ...input.context, prompt },
        }
      );

      const parsed = this.parseResponse(result.data?.response ?? result.data);
      logs.push(...result.logs);
      logs.push(`Labels: ${parsed.labels.join(", ")}`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: "",
        agentId: this.id,
        taskId: input.taskId,
        message: `Classified as: ${parsed.labels.join(", ")}`,
        level: "info",
        humanMessage: `Email classified: ${parsed.labels.join(", ")}`,
      });

      return { success: true, logs, data: { classification: parsed } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`LLM classification failed, using heuristic: ${message}`);
      const fallback = heuristicClassify(email);
      return { success: true, logs, data: { classification: fallback } };
    }
  }

  private parseResponse(raw: unknown): ClassificationResult {
    let parsed: Record<string, unknown> = {};
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { labels: ["personal"], confidence: 0.3, summary: raw.slice(0, 100) };
      }
    } else if (raw && typeof raw === "object") {
      parsed = raw as Record<string, unknown>;
    }

    const rawLabels = Array.isArray(parsed.labels) ? parsed.labels : [];
    const labels = rawLabels
      .filter((l): l is string => typeof l === "string")
      .map((l) => l.toLowerCase())
      .filter((l): l is EmailLabel => VALID_LABELS.includes(l as EmailLabel));

    return {
      labels: labels.length > 0 ? labels : ["personal"],
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0.5,
      summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
    };
  }
}
