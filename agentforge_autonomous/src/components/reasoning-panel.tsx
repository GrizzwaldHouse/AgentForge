"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { AGENT_COLORS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/format";
import type { AgentEvent, AgentLogEvent } from "@/core/events/types";

interface ReasoningPanelProps {
  events: AgentEvent[];
}

const levelBadge: Record<string, { bg: string; text: string }> = {
  info: { bg: "bg-[var(--accent-blue)]/15", text: "text-[var(--accent-blue)]" },
  warn: { bg: "bg-[var(--accent-amber)]/15", text: "text-[var(--accent-amber)]" },
  error: { bg: "bg-[var(--accent-red)]/15", text: "text-[var(--accent-red)]" },
  debug: { bg: "bg-[var(--bg-tertiary)]", text: "text-[var(--text-secondary)]" },
};

export function ReasoningPanel({ events }: ReasoningPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const logEvents = events.filter(
    (e): e is AgentLogEvent => e.type === "agent:log",
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logEvents.length]);

  // Group by agent
  const grouped = new Map<string, AgentLogEvent[]>();
  for (const log of logEvents) {
    const group = grouped.get(log.agentId) ?? [];
    group.push(log);
    grouped.set(log.agentId, group);
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-3 space-y-4">
      {grouped.size === 0 && (
        <div className="text-[var(--text-secondary)] text-center py-8 text-sm">
          No agent logs yet
        </div>
      )}
      {Array.from(grouped.entries()).map(([agentId, logs]) => {
        const color = AGENT_COLORS[agentId] ?? "var(--accent-blue)";
        return (
          <div key={agentId}>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color }}
            >
              {agentId}
            </h3>
            <div className="space-y-1">
              {logs.map((log) => {
                const badge = levelBadge[log.level] ?? levelBadge.info;
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-2 px-2 py-1 rounded text-xs",
                      log.level === "debug" && "dev-only",
                    )}
                  >
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                        badge.bg,
                        badge.text,
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="flex-1 leading-relaxed text-[var(--text-primary)]">
                      {log.humanMessage ?? log.message}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
