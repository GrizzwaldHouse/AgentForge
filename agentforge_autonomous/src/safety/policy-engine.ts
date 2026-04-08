/**
 * PolicyEngine — evaluates actions against configured policy rules.
 * Returns ALLOW, BLOCK, or REQUIRE_APPROVAL decision.
 */

import type { SafetyAction, PolicyResult, PolicyConfig } from "./types";

export const DEFAULT_POLICY: PolicyConfig = {
  allowedDomains: [],
  blockedDomains: [],
  maxRecipients: 5,
  maxMessageLength: 10_000,
  requireApprovalForExternalSend: true,
  killSwitchEnabled: true,
};

function extractDomain(email: string): string | null {
  const match = email.match(/@([^@\s]+)$/);
  return match ? match[1].toLowerCase() : null;
}

export function evaluatePolicy(
  action: SafetyAction,
  config: PolicyConfig = DEFAULT_POLICY
): PolicyResult {
  // SEND_EMAIL / SEND_MESSAGE actions
  if (action.type === "SEND_EMAIL" || action.type === "SEND_MESSAGE") {
    const recipients = action.payload.recipients;
    const body = action.payload.body;

    // Check message length
    if (typeof body === "string" && body.length > config.maxMessageLength) {
      return {
        decision: "BLOCK",
        reason: `Message length ${body.length} exceeds max ${config.maxMessageLength}`,
        ruleId: "max-message-length",
      };
    }

    // Check recipient count
    if (Array.isArray(recipients)) {
      if (recipients.length > config.maxRecipients) {
        return {
          decision: "REQUIRE_APPROVAL",
          reason: `Recipient count ${recipients.length} exceeds max ${config.maxRecipients}`,
          ruleId: "max-recipients",
        };
      }

      // Check each recipient domain
      for (const recipient of recipients) {
        if (typeof recipient !== "string") continue;
        const domain = extractDomain(recipient);
        if (!domain) continue;

        if (config.blockedDomains.includes(domain)) {
          return {
            decision: "BLOCK",
            reason: `Domain "${domain}" is blocked`,
            ruleId: "blocked-domain",
          };
        }

        if (
          config.allowedDomains.length > 0 &&
          !config.allowedDomains.includes(domain)
        ) {
          if (config.requireApprovalForExternalSend) {
            return {
              decision: "REQUIRE_APPROVAL",
              reason: `Domain "${domain}" not in allowed list`,
              ruleId: "external-domain",
            };
          }
          return {
            decision: "BLOCK",
            reason: `Domain "${domain}" not allowed`,
            ruleId: "external-domain",
          };
        }
      }
    }
  }

  // DELETE_FILE / EXECUTE_COMMAND — always require approval
  if (action.type === "DELETE_FILE" || action.type === "EXECUTE_COMMAND") {
    return {
      decision: "REQUIRE_APPROVAL",
      reason: `Destructive action requires approval`,
      ruleId: "destructive-action",
    };
  }

  return { decision: "ALLOW" };
}
