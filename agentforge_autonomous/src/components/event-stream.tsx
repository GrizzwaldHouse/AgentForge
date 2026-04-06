"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { AGENT_COLORS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/format";
import type { AgentEvent } from "@/core/events/types";

interface EventStreamProps {
  events: AgentEvent[];
  maxVisible?: number;
}

const eventTypeColor: Record<string, string> = {
  "agent:start":    "text-[var(--accent-blue)]",
  "agent:progress": "text-[var(--accent-purple)]",
  "agent:log":      "text-[var(--text-secondary)]",
  "agent:complete":  "text-[var(--accent-green)]",
  "agent:error":    "text-[var(--accent-red)]",
  "session:start":  "text-[var(--accent-amber)]",
  "session:end":    "text-[var(--accent-amber)]",
  heartbeat:        "text-[var(--border-color)]",
};

function formatEvent(event: AgentEvent): string {
  switch (event.type) {
    case "agent:start":
      return `Agent ${event.agentId} started task ${event.taskId}`;
    case "agent:progress":
      return `Agent ${event.agentId} — ${event.progress}%${event.message ? ` ${event.message}` : ""}`;
    case "agent:log":
      return `[${event.level}] ${event.agentId}: ${event.message}`;
    case "agent:complete":
      return `Agent ${event.agentId} ${event.success ? "completed" : "failed"} (${event.durationMs}ms)`;
    case "agent:error":
      return `Agent ${event.agentId} error: ${event.error}`;
    case "session:start":
      return `Session started — agents: ${event.agentIds.join(", ")}`;
    case "session:end":
      return `Session ended (${event.totalDurationMs}ms)`;
    case "heartbeat":
      return "heartbeat";
    default:
      return JSON.stringify(event);
  }
}

function getAgentId(event: AgentEvent): string | null {
  if ("agentId" in event) return event.agentId;
  return null;
}

export function EventStream({ events, maxVisible = 200 }: EventStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = events.slice(-maxVisible).filter((e) => e.type !== "heartbeat");

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [visible.length]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto font-mono text-xs leading-relaxed"
    >
      {visible.length === 0 && (
        <div className="text-[var(--text-secondary)] text-center py-8">
          Waiting for events...
        </div>
      )}
      {visible.map((event) => {
        const agentId = getAgentId(event);
        const agentColor = agentId ? AGENT_COLORS[agentId] : undefined;
        const typeColor = eventTypeColor[event.type] ?? "text-[var(--text-secondary)]";

        return (
          <div key={event.id} className="flex gap-2 px-2 py-0.5 hover:bg-[var(--bg-tertiary)]">
            <span className="text-[var(--text-secondary)] shrink-0">
              {formatTimestamp(event.timestamp)}
            </span>
            <span className={cn("shrink-0 w-24 truncate", typeColor)}>
              {event.type}
            </span>
            <span className="truncate">
              {agentColor && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: agentColor }}
                />
              )}
              {formatEvent(event)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
