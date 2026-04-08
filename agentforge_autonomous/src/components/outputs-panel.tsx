"use client";

import { AGENT_COLORS } from "@/lib/constants";
import type { AgentEvent, AgentCompleteEvent } from "@/core/events/types";

interface OutputsPanelProps {
  events: AgentEvent[];
}

export function OutputsPanel({ events }: OutputsPanelProps) {
  const completeEvents = events.filter(
    (e): e is AgentCompleteEvent =>
      e.type === "agent:complete" && e.data != null,
  );

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {completeEvents.length === 0 && (
        <div className="text-[var(--text-secondary)] text-center py-8 text-sm">
          No agent outputs yet
        </div>
      )}
      {completeEvents.map((event) => {
        const color = AGENT_COLORS[event.agentId] ?? "var(--accent-blue)";
        return (
          <details key={event.id} className="group">
            <summary
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-colors"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium" style={{ color }}>
                {event.agentId}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {event.success ? "success" : "failed"} &middot; {event.durationMs}ms
              </span>
            </summary>
            <pre className="mt-1 p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </details>
        );
      })}
    </div>
  );
}
