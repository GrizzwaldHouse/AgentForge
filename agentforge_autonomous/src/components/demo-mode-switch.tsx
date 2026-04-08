"use client";

import { useDemoMode } from "@/hooks/use-demo-mode";

export function DemoModeSwitch() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <button
      onClick={toggleDemoMode}
      className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
        isDemoMode
          ? "border-[var(--accent-purple)] text-[var(--accent-purple)] bg-[var(--accent-purple)]/10"
          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
      }`}
      title="Toggle demo mode for OBS recording"
    >
      <span className={`inline-block w-2 h-2 rounded-full ${isDemoMode ? "bg-[var(--accent-purple)]" : "bg-[var(--text-secondary)]"}`} />
      OBS
    </button>
  );
}
