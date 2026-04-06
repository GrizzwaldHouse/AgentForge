"use client";

import { cn } from "@/lib/cn";
import type { ConnectionStatus } from "@/hooks/use-agent-events";

interface DashboardHeaderProps {
  connectionStatus: ConnectionStatus;
  eventCount: number;
  onClear: () => void;
}

const statusDisplay: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connecting:    { label: "Connecting",    dotClass: "bg-[var(--accent-amber)] animate-pulse" },
  connected:     { label: "Connected",     dotClass: "bg-[var(--accent-green)]" },
  disconnected:  { label: "Disconnected",  dotClass: "bg-[var(--accent-red)]" },
};

export function DashboardHeader({ connectionStatus, eventCount, onClear }: DashboardHeaderProps) {
  const { label, dotClass } = statusDisplay[connectionStatus];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">AgentForge</h1>
        <span className="text-xs text-[var(--text-secondary)]">Observability Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-[var(--text-secondary)]">
          {eventCount} events
        </span>

        <button
          onClick={onClear}
          className="px-2 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Clear
        </button>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span className={cn("inline-block w-2 h-2 rounded-full", dotClass)} />
          {label}
        </span>
      </div>
    </header>
  );
}
