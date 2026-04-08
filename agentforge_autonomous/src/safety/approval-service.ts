/**
 * ApprovalService — human-in-the-loop approval for gated actions.
 * In-memory store for pending/resolved approvals.
 */

import type { SafetyAction, ApprovalRecord } from "./types";

class ApprovalServiceImpl {
  private approvals = new Map<string, ApprovalRecord>();

  request(action: SafetyAction): ApprovalRecord {
    const record: ApprovalRecord = {
      actionId: action.id,
      action,
      status: "PENDING",
      requestedAt: Date.now(),
    };
    this.approvals.set(action.id, record);
    return record;
  }

  approve(actionId: string, approvedBy = "user"): boolean {
    const record = this.approvals.get(actionId);
    if (!record || record.status !== "PENDING") {
      return false;
    }
    record.status = "APPROVED";
    record.resolvedAt = Date.now();
    record.resolvedBy = approvedBy;
    return true;
  }

  reject(actionId: string, rejectedBy = "user"): boolean {
    const record = this.approvals.get(actionId);
    if (!record || record.status !== "PENDING") {
      return false;
    }
    record.status = "REJECTED";
    record.resolvedAt = Date.now();
    record.resolvedBy = rejectedBy;
    return true;
  }

  isApproved(actionId: string): boolean {
    return this.approvals.get(actionId)?.status === "APPROVED";
  }

  get(actionId: string): ApprovalRecord | undefined {
    return this.approvals.get(actionId);
  }

  getPending(): ApprovalRecord[] {
    return Array.from(this.approvals.values()).filter(
      (r) => r.status === "PENDING"
    );
  }

  clear(): void {
    this.approvals.clear();
  }
}

// Singleton instance
export const approvalService = new ApprovalServiceImpl();
