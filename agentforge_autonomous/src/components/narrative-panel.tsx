"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { formatTimestamp } from "@/lib/format";
import type { NarrativeEntry } from "@/lib/narrative";
import { fadeInUp } from "@/lib/animation-variants";

interface NarrativePanelProps {
  entries: NarrativeEntry[];
}

const levelIcon: Record<NarrativeEntry["level"], string> = {
  info: "\u25CB",
  warn: "\u25B3",
  error: "\u2715",
  success: "\u2713",
};

export function NarrativePanel({ entries }: NarrativePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries.length]);

  // Group entries by phase for visual separation
  let lastPhase: string | null = null;

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto p-3 space-y-1"
    >
      {entries.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="text-sm text-[var(--text-primary)] mb-2">
            Welcome to AgentForge!
          </div>
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Click the <span className="text-[var(--accent-blue)]">Run</span> button above to start your first pipeline.
            Each agent plans, builds, reviews, and tests your code automatically.
          </div>
        </div>
      )}
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const showPhaseHeader = entry.phase !== lastPhase;
          lastPhase = entry.phase;

          return (
            <div key={entry.id}>
              {showPhaseHeader && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-1 px-1"
                  style={{ color: entry.color }}
                >
                  {entry.phase}
                </motion.div>
              )}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn(
                  "narrative-entry flex items-start gap-2 px-2 py-1.5 rounded text-sm",
                  "hover:bg-[var(--bg-tertiary)] transition-colors",
                )}
              >
                <span
                  className="shrink-0 text-xs mt-0.5 w-4 text-center"
                  style={{ color: entry.color }}
                >
                  {levelIcon[entry.level]}
                </span>
                <span className="flex-1 leading-relaxed">
                  {entry.message}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] shrink-0 mt-0.5">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
