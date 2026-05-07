"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAgentEvents } from "@/hooks/use-agent-events";
import type { AgentEvent } from "@/core/events/types";

const EVENT_PILL: Record<string, { text: string; bg: string; glow: string }> = {
  "agent:start":    { text: "text-white/60",   bg: "bg-white/[0.08]",                     glow: "" },
  "agent:progress": { text: "text-[#c4a8ff]",  bg: "bg-[rgba(196,168,255,0.12)]",          glow: "shadow-[0_0_6px_rgba(196,168,255,0.3)]" },
  "agent:log":      { text: "text-white/40",   bg: "bg-white/[0.05]",                     glow: "" },
  "agent:complete": { text: "text-[#a0f0c0]",  bg: "bg-[rgba(160,240,192,0.12)]",          glow: "shadow-[0_0_6px_rgba(160,240,192,0.3)]" },
  "agent:error":    { text: "text-[#f0a0a8]",  bg: "bg-[rgba(240,160,168,0.12)]",          glow: "shadow-[0_0_6px_rgba(240,160,168,0.3)]" },
  "session:start":  { text: "text-[#f0c9a0]",  bg: "bg-[rgba(240,201,160,0.12)]",          glow: "" },
  "session:end":    { text: "text-[#f0c9a0]",  bg: "bg-[rgba(240,201,160,0.10)]",          glow: "" },
  "heartbeat":      { text: "text-white/15",   bg: "bg-white/[0.03]",                     glow: "" },
};

function getStyle(type: AgentEvent["type"]) {
  return EVENT_PILL[type] ?? { text: "text-white/40", bg: "bg-white/[0.06]", glow: "" };
}

function eventMessage(event: AgentEvent): string {
  switch (event.type) {
    case "agent:start":    return `${event.agentId} started task ${event.taskId}`;
    case "agent:progress": return `${event.agentId} — ${event.progress}% ${event.message ?? ""}`;
    case "agent:log":      return `[${event.level}] ${event.agentId}: ${event.message}`;
    case "agent:complete": return `${event.agentId} completed (${event.durationMs}ms) ${event.success ? "✓" : "✕"}`;
    case "agent:error":    return `${event.agentId} error: ${event.error}`;
    case "session:start":  return `Session started · ${event.agentIds.length} agents`;
    case "session:end":    return `Session ended · ${event.totalDurationMs}ms`;
    case "heartbeat":      return "heartbeat";
  }
}

function formatTs(ts: number): string {
  const d = new Date(ts);
  return `${d.toTimeString().slice(0, 8)}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

export function EventStreamFeed() {
  const { events, status, clearEvents } = useAgentEvents();
  const [paused, setPaused] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const visibleEvents = events.filter((e) => e.type !== "heartbeat");

  // Auto-scroll when not paused
  useEffect(() => {
    if (!paused && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleEvents.length, paused]);

  const slideIn = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit:    { opacity: 0, x: reduceMotion ? 0 : -12, transition: { duration: 0.15 } },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/28">Live Event Stream</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(196,168,255,0.12)] text-[#c4a8ff] shadow-[0_0_6px_rgba(196,168,255,0.25)]">
          {visibleEvents.length} events
        </span>
      </div>

      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {visibleEvents.length === 0 && (
          <div className="text-[11px] text-white/22 text-center py-8">
            {status === "connected" ? "Waiting for events…" : `Connection: ${status}`}
          </div>
        )}
        <AnimatePresence initial={false}>
          {visibleEvents.map((event) => {
            const s = getStyle(event.type);
            return (
              <motion.div key={event.id} variants={slideIn} initial="initial" animate="animate" exit="exit"
                className="flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-white/[0.03] transition-colors cursor-default">
                <span className="text-white/22 flex-shrink-0 font-mono text-[10px] whitespace-nowrap">{formatTs(event.timestamp)}</span>
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${s.text} ${s.bg} ${s.glow}`}>
                  {event.type}
                </span>
                <span className="text-white/35 overflow-hidden text-ellipsis whitespace-nowrap flex-1 font-mono text-[10px]">
                  {eventMessage(event)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {paused && visibleEvents.length > 0 && (
        <div className="flex justify-center py-1.5 border-t border-white/[0.06] flex-shrink-0">
          <button onClick={() => { setPaused(false); if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }}
            className="text-[10px] text-[#c4a8ff] hover:text-white/80 transition-colors">
            ↓ Scroll to latest
          </button>
        </div>
      )}

      <div className="flex gap-2 px-3 py-2 border-t border-white/[0.07] flex-shrink-0">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={clearEvents}
          className="text-[11px] px-3 py-1 rounded-full border border-white/[0.10] bg-white/[0.04] text-white/40 hover:border-white/20 hover:text-white/65 transition-all backdrop-blur-xl">
          Clear feed
        </motion.button>
      </div>
    </div>
  );
}
