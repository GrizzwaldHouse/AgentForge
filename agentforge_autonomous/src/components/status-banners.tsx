"use client";

import type { ConnectionStatus } from "@/hooks/use-agent-events";

interface StatusBannersProps {
  connectionStatus: ConnectionStatus;
  pipelineStarting: boolean;
  lastError: { agentId: string; error: string } | null;
}

/**
 * Renders the dashboard status banners: connection lost, pipeline starting, agent error.
 * Extracted from DashboardPage to reduce its JSX complexity.
 */
export function StatusBanners({ connectionStatus, pipelineStarting, lastError }: StatusBannersProps) {
  return (
    <>
      {connectionStatus === "disconnected" && (
        <div className="px-6 py-2 bg-[var(--accent-red)]/10 border-b border-[var(--accent-red)]/30 text-sm text-[var(--accent-red)] text-center">
          Connection lost — Reconnecting...
        </div>
      )}

      {pipelineStarting && (
        <div className="px-6 py-2 bg-[var(--accent-blue)]/10 border-b border-[var(--accent-blue)]/30 text-sm text-[var(--accent-blue)] text-center animate-pulse">
          Starting pipeline...
        </div>
      )}

      {lastError && (
        <div className="px-6 py-2 bg-[var(--accent-red)]/10 border-b border-[var(--accent-red)]/30 text-sm text-[var(--accent-red)] text-center">
          Agent <span className="font-semibold">{lastError.agentId}</span> failed: {lastError.error}
        </div>
      )}
    </>
  );
}
