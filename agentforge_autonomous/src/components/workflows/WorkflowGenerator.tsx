"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animation-variants";
import type { WorkflowDefinition } from "@/workflows/types";

interface Props {
  workflow: WorkflowDefinition | null;
  onValidate: () => void;
  onExecute: () => void;
}

function workflowSummary(wf: WorkflowDefinition): string {
  const trigger =
    wf.trigger.type === "schedule" ? `on schedule (${wf.trigger.cron})`
    : wf.trigger.type === "event"  ? `on event "${wf.trigger.eventType}"`
    : "manually";
  const stepTypes = wf.steps.map((s) => s.type).join(", ");
  return `"${wf.name}" triggers ${trigger} and runs ${wf.steps.length} step${wf.steps.length !== 1 ? "s" : ""}: ${stepTypes}.`;
}

export function WorkflowGenerator({ workflow, onValidate, onExecute }: Props) {
  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/25 text-[12px] p-6 text-center">
        <motion.div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl"
          animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }}>⚙</motion.div>
        No output yet — use Voice Input or type an intent and click Generate.
      </div>
    );
  }

  const dslJson = JSON.stringify(workflow, null, 2);

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      {/* Summary card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate"
        className="rounded-2xl border border-white/[0.10] bg-white/[0.05] backdrop-blur-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.07] bg-white/[0.03]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
            <span className="text-[#c4a8ff]">⚙</span> Plain-English Summary
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[rgba(160,240,192,0.12)] text-[#a0f0c0] shadow-[0_0_8px_rgba(160,240,192,0.3)]">
            Generated
          </span>
        </div>
        <div className="px-3.5 py-3 text-[12px] text-white/72 leading-relaxed">{workflowSummary(workflow)}</div>
      </motion.div>

      {/* DSL card */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate"
        className="rounded-2xl border border-white/[0.10] bg-white/[0.05] backdrop-blur-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.07] bg-white/[0.03] flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
            <span className="text-[#a8d8c8]">{"{}"}</span> Generated DSL (JSON)
          </span>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigator.clipboard.writeText(dslJson).catch(() => {})}
            className="text-[10px] px-2.5 py-0.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-white/45 hover:border-white/20 hover:text-white/70 transition-colors">
            Copy
          </motion.button>
        </div>
        <div className="px-3.5 py-3 overflow-x-auto flex-1">
          <pre className="font-mono text-sm text-white/70 bg-white/[0.04] rounded-xl p-4 overflow-auto max-h-64 border border-white/[0.08]">
            {dslJson}
          </pre>
        </div>
        <div className="flex gap-2 px-3.5 py-3 border-t border-white/[0.07] flex-shrink-0">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onValidate}
            className="flex-1 text-[11px] py-1.5 rounded-xl border border-white/[0.10] bg-white/[0.05] text-white/65 hover:border-white/20 transition-all backdrop-blur-xl">
            ✓ Validate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(196,168,255,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onExecute}
            className="flex-1 text-[11px] py-1.5 rounded-xl border border-[rgba(196,168,255,0.4)] text-white/88 transition-all backdrop-blur-xl"
            style={{ background: "linear-gradient(135deg, rgba(196,168,255,0.2), rgba(168,216,200,0.14))" }}>
            ▶ Execute
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
