"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ApprovalRecord, AuditEntry } from "@/safety";

interface KillSwitchStatus {
  active: boolean;
  activatedAt?: number;
  reason?: string;
}

interface SafetyState {
  killSwitch: KillSwitchStatus;
  pendingApprovals: ApprovalRecord[];
  recentAudit: AuditEntry[];
}

const POLL_INTERVAL_MS = 3_000;

const STATUS_COLORS: Record<AuditEntry["status"], string> = {
  ALLOWED: "var(--accent-green)",
  EXECUTED: "var(--accent-green)",
  BLOCKED: "var(--accent-red)",
  HALTED: "var(--accent-red)",
  WAITING_APPROVAL: "var(--accent-amber)",
};

function formatRelativeTime(timestamp: number | string): string {
  const t = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = Date.now() - t;
  if (diff < 1_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatPayload(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  if (Array.isArray(payload.recipients)) {
    parts.push(`To: ${payload.recipients.join(", ")}`);
  }
  if (typeof payload.subject === "string") {
    parts.push(`Subject: ${payload.subject}`);
  }
  if (typeof payload.body === "string") {
    const preview = payload.body.slice(0, 120);
    parts.push(`Body: ${preview}${payload.body.length > 120 ? "..." : ""}`);
  }
  return parts.length > 0 ? parts.join(" | ") : JSON.stringify(payload).slice(0, 200);
}

export default function SafetyPage() {
  const [state, setState] = useState<SafetyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [killReason, setKillReason] = useState("");
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const response = await fetch("/api/safety");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: SafetyState = await response.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchState]);

  const postAction = useCallback(
    async (action: string, extra: Record<string, string> = {}) => {
      try {
        const response = await fetch("/api/safety", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...extra }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${response.status}`);
        }
        await fetchState();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    },
    [fetchState]
  );

  const handleKill = useCallback(async () => {
    await postAction("kill", { reason: killReason || "manual" });
    setKillReason("");
  }, [postAction, killReason]);

  const handleResume = useCallback(async () => {
    await postAction("resume");
  }, [postAction]);

  const handleApprove = useCallback(
    async (actionId: string) => {
      setBusyActionId(actionId);
      await postAction("approve", { actionId });
      setBusyActionId(null);
    },
    [postAction]
  );

  const handleReject = useCallback(
    async (actionId: string) => {
      setBusyActionId(actionId);
      await postAction("reject", { actionId });
      setBusyActionId(null);
    },
    [postAction]
  );

  const killSwitchActive = state?.killSwitch.active ?? false;
  const pendingCount = state?.pendingApprovals.length ?? 0;

  const sortedAudit = useMemo(() => {
    if (!state?.recentAudit) return [];
    return [...state.recentAudit].reverse();
  }, [state?.recentAudit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-[var(--text-secondary)]">
          Loading safety inbox...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 rounded border border-[var(--accent-red)] bg-[var(--accent-red)]/10 text-sm text-[var(--accent-red)]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Kill Switch ========== */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold mb-1">Kill Switch</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Global hard stop for all safety-gated agent actions.
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
              killSwitchActive
                ? "bg-[var(--accent-red)]/20 text-[var(--accent-red)]"
                : "bg-[var(--accent-green)]/20 text-[var(--accent-green)]"
            )}
          >
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full",
                killSwitchActive
                  ? "bg-[var(--accent-red)] animate-pulse"
                  : "bg-[var(--accent-green)]"
              )}
            />
            {killSwitchActive ? "HALTED" : "ACTIVE"}
          </div>
        </div>

        {killSwitchActive && state?.killSwitch.reason && (
          <div className="mb-4 px-3 py-2 rounded bg-[var(--bg-tertiary)] text-xs">
            <span className="text-[var(--text-secondary)]">Reason:</span>{" "}
            <span className="text-[var(--text-primary)]">{state.killSwitch.reason}</span>
            {state.killSwitch.activatedAt && (
              <span className="text-[var(--text-secondary)] ml-2">
                ({formatRelativeTime(state.killSwitch.activatedAt)})
              </span>
            )}
          </div>
        )}

        {killSwitchActive ? (
          <button
            onClick={handleResume}
            className="w-full px-4 py-3 rounded bg-[var(--accent-green)] text-[var(--bg-primary)] font-bold text-sm hover:brightness-110 transition-all"
          >
            RESUME SYSTEM
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Reason (optional)"
              value={killReason}
              onChange={(e) => setKillReason(e.target.value)}
              maxLength={500}
              className="flex-1 px-3 py-2 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-red)]"
            />
            <button
              onClick={handleKill}
              className="px-6 py-2 rounded bg-[var(--accent-red)] text-white font-bold text-sm hover:brightness-110 transition-all"
            >
              HALT ALL AGENTS
            </button>
          </div>
        )}
      </section>

      {/* ========== Pending Approvals ========== */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold mb-1">Pending Approvals</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Actions awaiting human review before execution.
            </p>
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              pendingCount > 0
                ? "bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            )}
          >
            {pendingCount} pending
          </div>
        </div>

        {pendingCount === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
            No actions awaiting approval
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {state?.pendingApprovals.map((record) => (
                <motion.div
                  key={record.actionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded border border-[var(--accent-amber)]/40 bg-[var(--bg-tertiary)] p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]">
                        {record.action.type}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        by {record.action.agentId}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {formatRelativeTime(record.requestedAt)}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text-primary)] mb-3 break-words">
                    {formatPayload(record.action.payload)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(record.actionId)}
                      disabled={busyActionId === record.actionId}
                      className="flex-1 px-3 py-1.5 rounded bg-[var(--accent-green)] text-[var(--bg-primary)] text-xs font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(record.actionId)}
                      disabled={busyActionId === record.actionId}
                      className="flex-1 px-3 py-1.5 rounded bg-[var(--accent-red)] text-white text-xs font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ========== Audit Log ========== */}
      <section className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold mb-1">Audit Log</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Recent safety-gated actions (last 50, newest first).
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {sortedAudit.length} entries
          </div>
        </div>

        {sortedAudit.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
            No audit entries yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {sortedAudit.map((entry, idx) => (
              <div
                key={`${entry.timestamp}-${idx}`}
                className="flex items-start gap-3 px-3 py-2 rounded bg-[var(--bg-tertiary)] text-xs"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="font-bold"
                      style={{ color: STATUS_COLORS[entry.status] }}
                    >
                      {entry.status}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {entry.actionType}
                    </span>
                    <span className="text-[var(--text-secondary)]">·</span>
                    <span className="text-[var(--text-secondary)] truncate">
                      {entry.agentId}
                    </span>
                  </div>
                  {entry.reason && (
                    <div className="text-[var(--text-secondary)] break-words">
                      {entry.reason}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] shrink-0">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
