/**
 * Gmail agent registry — factory to create Gmail-specific agent pipeline.
 * These agents run in sequence: Classification → Priority → Response
 */

import type { Agent } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { ClassificationAgent } from "./ClassificationAgent";
import { PriorityAgent } from "./PriorityAgent";
import { GmailResponseAgent } from "./GmailResponseAgent";

export type {
  GmailMessage,
  EmailLabel,
  EmailPriority,
  ClassificationResult,
  PriorityResult,
  ResponseDraft,
} from "./types";

export { ClassificationAgent, PriorityAgent, GmailResponseAgent };

export function createGmailAgents(backend?: ExecutionBackend): Agent[] {
  return [
    new ClassificationAgent(backend),
    new PriorityAgent(backend),
    new GmailResponseAgent(backend),
  ];
}
