"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import type { ConnectionStatus } from "@/hooks/use-agent-events";
import { DemoModeSwitch } from "@/components/demo-mode-switch";
import { RunPipelineDialog } from "@/components/run-pipeline-dialog";
import { runPipeline, type BackendMode } from "@/lib/run-pipeline";
import Link from "next/link";

interface DashboardHeaderProps {
  connectionStatus: ConnectionStatus;
  eventCount: number;
  pipelineRunning: boolean;
  onClear: () => void;
}

const statusDisplay: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connecting:    { label: "Starting...",  dotClass: "bg-[var(--accent-amber)] animate-pulse" },
  connected:     { label: "Ready",        dotClass: "bg-[var(--accent-green)]" },
  disconnected:  { label: "Offline",      dotClass: "bg-[var(--accent-red)]" },
};

export function DashboardHeader({ connectionStatus, eventCount, pipelineRunning, onClear }: DashboardHeaderProps) {
  const { label, dotClass } = statusDisplay[connectionStatus];
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRunSubmit = useCallback(
    async (description: string, backend: BackendMode) => {
      setDialogOpen(false);
      await runPipeline(description, backend);
    },
    [],
  );

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">AgentForge</h1>
          <span className="text-xs text-[var(--text-secondary)]">Observability Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Run Pipeline button */}
          <button
            onClick={() => setDialogOpen(true)}
            disabled={pipelineRunning}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors",
              pipelineRunning
                ? "bg-[var(--accent-blue)]/30 text-[var(--accent-blue)] cursor-not-allowed animate-pulse"
                : "bg-[var(--accent-blue)] text-white hover:brightness-110",
            )}
          >
            {pipelineRunning ? "Running..." : "Run"}
          </button>

          <Link
            href="/workflows"
            className="px-3 py-1.5 text-xs rounded border border-[var(--accent-purple)] text-[var(--accent-purple)] hover:bg-[var(--accent-purple)] hover:text-[var(--bg-primary)] transition-colors"
          >
            Workflows
          </Link>

          <Link
            href="/jobs"
            className="px-3 py-1.5 text-xs rounded border border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-[var(--bg-primary)] transition-colors"
          >
            Job Tracker
          </Link>

          <Link
            href="/safety"
            className="px-3 py-1.5 text-xs rounded border border-[var(--accent-amber)] text-[var(--accent-amber)] hover:bg-[var(--accent-amber)] hover:text-[var(--bg-primary)] transition-colors"
          >
            Safety Inbox
          </Link>

          <span className="text-xs text-[var(--text-secondary)]">
            {eventCount} events
          </span>

          <button
            onClick={onClear}
            className="px-2 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Clear
          </button>

          <DemoModeSwitch />

          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            Status:
            <span className={cn("inline-block w-2 h-2 rounded-full", dotClass)} />
            {label}
          </span>
        </div>
      </header>

      <RunPipelineDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleRunSubmit}
      />
    </>
  );
}
