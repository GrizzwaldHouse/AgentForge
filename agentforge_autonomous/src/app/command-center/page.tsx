"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import { ProposalTab } from "@/components/command-center/ProposalTab";
import { ListingTab } from "@/components/command-center/ListingTab";
import { PackageTab } from "@/components/command-center/PackageTab";
import { IntakeTab } from "@/components/command-center/IntakeTab";
import type { AgentCompleteEvent } from "@/core/events/types";

type Tab = "proposal" | "listing" | "package" | "intake";

const TABS: { id: Tab; label: string }[] = [
  { id: "proposal", label: "Proposal" },
  { id: "listing",  label: "Listing"  },
  { id: "package",  label: "Package"  },
  { id: "intake",   label: "Intake"   },
];

// Each tab keeps its own result so switching tabs doesn't clear the previous output.
type TabResults = Record<Tab, string | null>;

const EMPTY_RESULTS: TabResults = {
  proposal: null,
  listing:  null,
  package:  null,
  intake:   null,
};

// fetch() with a ReadableStream reader is used instead of EventSource because the
// generate route is request-scoped: it opens, emits three frames, then closes.
// EventSource auto-reconnects on close, which would re-trigger generation unintentionally.
async function streamGenerate(
  payload: { taskType: string; prompt: string; systemPrompt: string },
  sessionId: string,
  taskId: string,
  onComplete: (text: string) => void,
  onError: (msg: string) => void,
): Promise<void> {
  const res = await fetch("/api/command-center/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, sessionId, taskId }),
  });

  if (!res.body) {
    onError("No response body from generate endpoint.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are delimited by double newline.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;

      try {
        const event = JSON.parse(line.slice(5).trim());
        if (event.type === "agent:complete" && event.success) {
          const completeEvent = event as AgentCompleteEvent;
          const data = completeEvent.data as { text?: string } | undefined;
          if (data?.text) {
            onComplete(data.text);
          }
        }
        if (event.type === "agent:log" && event.level === "error") {
          onError(event.message ?? "Generation failed.");
        }
      } catch {
        // Ignore unparseable frames.
      }
    }
  }
}

let sessionCounter = 0;
let taskCounter = 0;

function makeSessionId() {
  return `cc-session-${Date.now()}-${++sessionCounter}`;
}

function makeTaskId(tabId: Tab) {
  return `cc-${tabId}-${Date.now()}-${++taskCounter}`;
}

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("proposal");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<TabResults>(EMPTY_RESULTS);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(makeSessionId());

  const handleGenerate = useCallback(
    async (payload: { taskType: string; prompt: string; systemPrompt: string }) => {
      if (generating) return;
      setGenerating(true);
      setError(null);

      const taskId = makeTaskId(activeTab);

      try {
        await streamGenerate(
          payload,
          sessionIdRef.current,
          taskId,
          (text) => {
            setResults((prev) => ({ ...prev, [activeTab]: text }));
          },
          (msg) => {
            setError(msg);
          },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error during generation.");
      } finally {
        setGenerating(false);
      }
    },
    [generating, activeTab],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Command Center
        </h1>

        {/* Tab bar */}
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t transition-all",
                activeTab === tab.id
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-b-0 border-[var(--border-color)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-2 rounded border border-[var(--accent-red)] bg-[var(--bg-secondary)] text-sm text-[var(--accent-red)]">
          {error}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "proposal" && (
          <ProposalTab
            onGenerate={handleGenerate}
            generating={generating}
            result={results.proposal}
          />
        )}
        {activeTab === "listing" && (
          <ListingTab
            onGenerate={handleGenerate}
            generating={generating}
            result={results.listing}
          />
        )}
        {activeTab === "package" && (
          <PackageTab
            onGenerate={handleGenerate}
            generating={generating}
            result={results.package}
          />
        )}
        {activeTab === "intake" && (
          <IntakeTab
            onGenerate={handleGenerate}
            generating={generating}
            result={results.intake}
          />
        )}
      </div>
    </div>
  );
}
