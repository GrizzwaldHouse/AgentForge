"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "@/lib/format";
import type { NarrativeEntry } from "@/lib/narrative";
import { fadeInUp } from "@/lib/animation-variants";
import { AGENT_COLORS } from "@/lib/constants";

interface ActivityFeedProps {
  entries: NarrativeEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
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
      className="h-full overflow-y-auto p-4 space-y-2"
    >
      {entries.length === 0 && (
        <div className="text-[var(--text-secondary)] text-center py-8 text-sm">
          Waiting for activity...
        </div>
      )}
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const showPhaseHeader = entry.phase !== lastPhase;
          lastPhase = entry.phase;

          const agentColor = entry.agentId
            ? AGENT_COLORS[entry.agentId] ?? "var(--accent-blue)"
            : entry.color;

          return (
            <div key={entry.id}>
              {showPhaseHeader && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-semibold uppercase tracking-wider mt-4 mb-2 px-1"
                  style={{ color: agentColor }}
                >
                  {entry.phase}
                </motion.div>
              )}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex gap-3 relative"
              >
                {/* Vertical line */}
                <div className="relative">
                  <div
                    className="absolute left-[5px] top-[14px] bottom-[-8px] w-[2px]"
                    style={{
                      background: "var(--border-color)",
                    }}
                  />
                  {/* Colored circle dot */}
                  <div
                    className="relative z-10 w-3 h-3 rounded-full shrink-0 mt-1.5"
                    style={{
                      background: agentColor,
                      boxShadow: `0 0 8px ${agentColor}50`,
                    }}
                  />
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="text-sm leading-relaxed text-[var(--text-primary)]">
                    {entry.message}
                  </div>
                  <div
                    className="text-[10px] text-[var(--text-secondary)] mt-1"
                  >
                    {formatRelativeTime(entry.timestamp)}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
