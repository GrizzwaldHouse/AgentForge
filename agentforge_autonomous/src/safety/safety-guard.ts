/**
 * SafetyGuard — the single entry point for gating any agent action.
 *
 * Flow: killSwitch -> policyEngine -> approvalService -> auditLogger
 *
 * Usage:
 *   const result = await guardAction({
 *     id: "...",
 *     type: "SEND_EMAIL",
 *     agentId: "gmail-response",
 *     payload: { recipients: [...], body: "..." },
 *     timestamp: Date.now(),
 *   });
 *
 *   if (result.allowed) {
 *     // proceed with action
 *   }
 */

import { killSwitch } from "./kill-switch";
import { evaluatePolicy, DEFAULT_POLICY } from "./policy-engine";
import { approvalService } from "./approval-service";
import { auditLogger } from "./audit-logger";
import type { SafetyAction, PolicyConfig } from "./types";

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  actionId: string;
}

export async function guardAction(
  action: SafetyAction,
  config: PolicyConfig = DEFAULT_POLICY
): Promise<GuardResult> {
  // 1. Kill switch check
  if (config.killSwitchEnabled && killSwitch.isActive()) {
    auditLogger.log({
      actionId: action.id,
      actionType: action.type,
      agentId: action.agentId,
      status: "HALTED",
      reason: "Kill switch active",
    });
    return {
      allowed: false,
      reason: "System halted by kill switch",
      actionId: action.id,
    };
  }

  // 2. Policy evaluation
  const policyResult = evaluatePolicy(action, config);

  if (policyResult.decision === "BLOCK") {
    auditLogger.log({
      actionId: action.id,
      actionType: action.type,
      agentId: action.agentId,
      status: "BLOCKED",
      reason: policyResult.reason,
      details: { ruleId: policyResult.ruleId },
    });
    return {
      allowed: false,
      reason: policyResult.reason,
      actionId: action.id,
    };
  }

  if (policyResult.decision === "REQUIRE_APPROVAL") {
    // Check if already approved
    if (approvalService.isApproved(action.id)) {
      auditLogger.log({
        actionId: action.id,
        actionType: action.type,
        agentId: action.agentId,
        status: "EXECUTED",
        reason: "Pre-approved",
      });
      return { allowed: true, actionId: action.id };
    }

    // Request approval
    approvalService.request(action);
    auditLogger.log({
      actionId: action.id,
      actionType: action.type,
      agentId: action.agentId,
      status: "WAITING_APPROVAL",
      reason: policyResult.reason,
    });
    return {
      allowed: false,
      requiresApproval: true,
      reason: policyResult.reason,
      actionId: action.id,
    };
  }

  // 3. Allowed — log and return
  auditLogger.log({
    actionId: action.id,
    actionType: action.type,
    agentId: action.agentId,
    status: "ALLOWED",
  });
  return { allowed: true, actionId: action.id };
}
