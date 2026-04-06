"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { AGENT_COLORS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";

export type AgentStatus = "idle" | "running" | "error";

export interface AgentCardProps {
  id: string;
  name: string;
  status: AgentStatus;
  lastRunAt?: number | null;
  lastDurationMs?: number | null;
}

const statusConfig: Record<AgentStatus, { label: string; dotClass: string }> = {
  idle: { label: "Idle", dotClass: "bg-[var(--text-secondary)]" },
  running: { label: "Running", dotClass: "bg-[var(--accent-green)] animate-pulse" },
  error: { label: "Error", dotClass: "bg-[var(--accent-red)]" },
};

export function AgentCard({ id, name, status, lastRunAt, lastDurationMs }: AgentCardProps) {
  const color = AGENT_COLORS[id] ?? "var(--accent-blue)";
  const { label, dotClass } = statusConfig[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4",
        "transition-colors hover:border-[var(--text-secondary)]",
      )}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold truncate" style={{ color }}>
          {name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span className={cn("inline-block w-2 h-2 rounded-full", dotClass)} />
          {label}
        </span>
      </div>

      <div className="text-xs text-[var(--text-secondary)] space-y-1">
        {lastRunAt ? (
          <div>Last run: {formatRelativeTime(lastRunAt)}</div>
        ) : (
          <div>No runs yet</div>
        )}
        {lastDurationMs != null && (
          <div>Duration: {lastDurationMs < 1000 ? `${lastDurationMs}ms` : `${(lastDurationMs / 1000).toFixed(1)}s`}</div>
        )}
      </div>
    </motion.div>
  );
}
