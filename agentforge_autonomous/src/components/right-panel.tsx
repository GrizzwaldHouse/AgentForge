"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NarrativePanel } from "@/components/narrative-panel";
import { EventStream } from "@/components/event-stream";
import { OutputsPanel } from "@/components/outputs-panel";
import type { NarrativeEntry } from "@/lib/narrative";
import type { AgentEvent } from "@/core/events/types";

interface RightPanelProps {
  narrativeEntries: NarrativeEntry[];
  events: AgentEvent[];
}

type Tab = "activity" | "results" | "logs";

const tabs: { key: Tab; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "results", label: "Results" },
  { key: "logs", label: "Logs" },
];

export function RightPanel({ narrativeEntries, events }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("activity");

  return (
    <div className="flex flex-col h-full">
      {/* Tab triggers */}
      <div className="flex border-b border-[var(--border-color)] px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors border-b-2",
              activeTab === tab.key
                ? "border-[var(--accent-blue)] text-[var(--text-primary)] bg-[var(--bg-tertiary)]"
                : "border-transparent text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "activity" && (
          <NarrativePanel entries={narrativeEntries} />
        )}
        {activeTab === "results" && <OutputsPanel events={events} />}
        {activeTab === "logs" && <EventStream events={events} />}
      </div>
    </div>
  );
}
