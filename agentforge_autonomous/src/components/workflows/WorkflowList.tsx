"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animation-variants";
import type { WorkflowDefinition } from "@/workflows/types";

interface WorkflowListItem {
  id: string;
  name: string;
  trigger: WorkflowDefinition["trigger"];
  status: "RUNNING" | "SUCCESS" | "FAILED" | "IDLE";
  lastRunAt?: string;
}

type FilterType = "all" | "running" | "failed" | "idle";

interface Props {
  onSelect: (id: string) => void;
  selectedId?: string;
  onNewClick: () => void;
}

const STATUS: Record<WorkflowListItem["status"], { pill: string; glow: string; label: string; pulse: boolean }> = {
  RUNNING: { pill: "bg-[rgba(196,168,255,0.2)] text-[#c4a8ff] border border-[rgba(196,168,255,0.3)]", glow: "shadow-[0_0_8px_rgba(196,168,255,0.4)]", label: "RUNNING", pulse: true },
  SUCCESS: { pill: "bg-[rgba(160,240,192,0.15)] text-[#a0f0c0]", glow: "shadow-[0_0_8px_rgba(160,240,192,0.35)]", label: "SUCCESS", pulse: false },
  FAILED:  { pill: "bg-[rgba(240,160,168,0.15)] text-[#f0a0a8]", glow: "shadow-[0_0_8px_rgba(240,160,168,0.35)]", label: "FAILED",  pulse: false },
  IDLE:    { pill: "bg-white/10 text-white/45", glow: "", label: "IDLE", pulse: false },
};

function triggerIcon(t: WorkflowDefinition["trigger"]): string {
  return { schedule: "⏰", event: "⚡", manual: "▶" }[t.type] ?? "•";
}

function matchesFilter(item: WorkflowListItem, filter: FilterType): boolean {
  return filter === "all" || item.status.toLowerCase() === filter;
}

export function WorkflowList({ onSelect, selectedId, onNewClick }: Props) {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  function loadWorkflows() {
    setLoading(true);
    setLoadError(null);
    fetch("/api/workflows")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: WorkflowDefinition[]) =>
        setWorkflows(data.map((wf) => ({ id: wf.id, name: wf.name, trigger: wf.trigger, status: "IDLE" as const, lastRunAt: wf.updatedAt })))
      )
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadWorkflows(); }, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" }, { key: "running", label: "Running" },
    { key: "failed", label: "Failed" }, { key: "idle", label: "Idle" },
  ];
  const visible = workflows.filter((w) => matchesFilter(w, filter));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] flex-shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45">
          Workflows <span className="text-[#c4a8ff] font-bold ml-1">{workflows.length}</span>
        </span>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={onNewClick}
          className="text-[11px] px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 hover:border-[#c4a8ff]/50 hover:text-[#c4a8ff] backdrop-blur-xl transition-colors"
        >
          + New
        </motion.button>
      </div>

      <div className="flex gap-1.5 px-3 py-2 border-b border-white/[0.06] flex-shrink-0 overflow-x-auto">
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap ${
              filter === key
                ? "border-[#c4a8ff]/60 text-[#c4a8ff] bg-[rgba(196,168,255,0.12)]"
                : "border-white/[0.10] text-white/35 hover:text-white/65 hover:border-white/20"
            }`}
          >{label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading && (
          <div className="flex justify-center py-12">
            <motion.div className="w-7 h-7 rounded-full border-2 border-[#c4a8ff]/30 border-t-[#c4a8ff]"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
        )}

        {!loading && loadError && (
          <div className="flex flex-col items-center gap-3 py-10 px-3">
            <p className="text-[11px] text-[#f0a0a8] text-center">{loadError}</p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={loadWorkflows}
              className="text-[11px] px-3 py-1.5 rounded-full border border-[#f0a0a8]/30 text-[#f0a0a8] bg-[rgba(240,160,168,0.08)] hover:bg-[rgba(240,160,168,0.14)] transition-colors backdrop-blur-xl"
            >
              ↻ Retry
            </motion.button>
          </div>
        )}

        {!loading && !loadError && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div className="w-12 h-12 rounded-full bg-[rgba(196,168,255,0.08)] border border-[#c4a8ff]/20"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
            <span className="text-[12px] text-white/25">No workflows yet</span>
          </div>
        )}

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2.5">
          <AnimatePresence>
            {visible.map((wf) => {
              const s = STATUS[wf.status];
              const isSelected = selectedId === wf.id;
              return (
                <motion.div key={wf.id} variants={fadeInUp} layout
                  whileHover={{ y: -2, scale: 1.01, boxShadow: "0 8px_32px rgba(0,0,0,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(wf.id)}
                  className={`relative rounded-2xl border cursor-pointer overflow-hidden backdrop-blur-2xl p-3 transition-all duration-300 ${
                    isSelected
                      ? "border-[#c4a8ff]/50 bg-[rgba(196,168,255,0.08)] shadow-[0_0_24px_rgba(196,168,255,0.12)]"
                      : "border-white/[0.09] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.07] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                      style={{ background: "linear-gradient(to bottom, #c4a8ff, #a8d8c8)" }} />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white/88 truncate leading-snug">{wf.name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 ${s.pill} ${s.pulse ? "animate-pulse" : ""} ${s.glow}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/35">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
                      {triggerIcon(wf.trigger)} {wf.trigger.type}
                    </span>
                    {wf.lastRunAt && <span>{new Date(wf.lastRunAt).toLocaleDateString()}</span>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
