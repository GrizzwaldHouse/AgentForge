/**
 * Safety layer public API.
 * Reusable for any agent action — not Gmail-specific.
 */

export type {
  ActionType,
  SafetyAction,
  PolicyDecision,
  PolicyResult,
  PolicyConfig,
  ApprovalRecord,
  AuditEntry,
} from "./types";

export { killSwitch } from "./kill-switch";
export { evaluatePolicy, DEFAULT_POLICY } from "./policy-engine";
export { approvalService } from "./approval-service";
export { auditLogger } from "./audit-logger";
export { guardAction, type GuardResult } from "./safety-guard";
