/**
 * Gmail agent types — shared across Classification, Priority, and Response agents.
 */

export interface GmailMessage {
  messageId: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  timestamp: number;
  historyId?: string;
}

export type EmailLabel =
  | "important"
  | "work"
  | "personal"
  | "promotional"
  | "spam"
  | "newsletter"
  | "social"
  | "transactional"
  | "recruiter";

export type EmailPriority = "urgent" | "high" | "normal" | "low";

export interface ClassificationResult {
  labels: EmailLabel[];
  confidence: number;
  summary?: string;
}

export interface PriorityResult {
  priority: EmailPriority;
  score: number;
  reason: string;
}

export interface ResponseDraft {
  draft: string;
  tone: "formal" | "friendly" | "concise";
  suggestedSubject?: string;
}
