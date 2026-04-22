/**
 * Safety layer types — reusable for any agent action, not Gmail-specific.
 * Provides kill switch, policy evaluation, approval gating, and audit logging.
 */

export type ActionType =
  | "SEND_EMAIL"
  | "SEND_MESSAGE"
  | "MODIFY_FILE"
  | "DELETE_FILE"
  | "EXECUTE_COMMAND"
  | "AGENT_EXECUTE"
  | "API_CALL"
  | "CUSTOM";

export interface SafetyAction {
  id: string;
  type: ActionType;
  agentId: string;
  taskId?: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export type PolicyDecision = "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";

export interface PolicyResult {
  decision: PolicyDecision;
  reason?: string;
  ruleId?: string;
}

export interface PolicyConfig {
  allowedDomains: string[];
  blockedDomains: string[];
  maxRecipients: number;
  maxMessageLength: number;
  requireApprovalForExternalSend: boolean;
  killSwitchEnabled: boolean;
}

export interface ApprovalRecord {
  actionId: string;
  action: SafetyAction;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface AuditEntry {
  timestamp: string;
  actionId: string;
  actionType: ActionType;
  agentId: string;
  status: "ALLOWED" | "BLOCKED" | "WAITING_APPROVAL" | "EXECUTED" | "HALTED";
  reason?: string;
  details?: Record<string, unknown>;
}
