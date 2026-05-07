"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { WorkflowDefinition, WorkflowRun, StepRun, WorkflowStatus } from "@/workflows/types";

interface Props { workflowId: string | null; }

const STEP: Record<WorkflowStatus, { ring: string; text: string; icon: string; glow: string }> = {
  completed: { ring: "border-[#a0f0c0]", text: "text-[#a0f0c0]", icon: "✓", glow: "shadow-[0_0_12px_rgba(160,240,192,0.5)]" },
  running:   { ring: "border-[#c4a8ff]", text: "text-[#c4a8ff]", icon: "…", glow: "shadow-[0_0_12px_rgba(196,168,255,0.5)]" },
  failed:    { ring: "border-[#f0a0a8]", text: "text-[#f0a0a8]", icon: "✕", glow: "shadow-[0_0_12px_rgba(240,160,168,0.4)]" },
  pending:   { ring: "border-white/20",  text: "text-white/30",   icon: "·", glow: "" },
  validated: { ring: "border-[#f0dba0]", text: "text-[#f0dba0]", icon: "!", glow: "shadow-[0_0_12px_rgba(240,219,160,0.4)]" },
};

export function WorkflowDetail({ workflowId }: Props) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [rerunError, setRerunError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!workflowId) { setWorkflow(null); setRun(null); return; }
    setLoading(true);
    fetch(`/api/workflows/${workflowId}`)
      .then((r) => r.json())
      .then((d: WorkflowDefinition) => setWorkflow(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workflowId]);

  async function handleRerun() {
    if (!workflowId) return;
    setRunning(true);
    setRerunError(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      if (res.ok) setRun(await res.json());
      else setRerunError(`Run failed: HTTP ${res.status}`);
    } catch (e) {
      setRerunError(e instanceof Error ? e.message : "Run failed");
    } finally { setRunning(false); }
  }

  if (!workflowId) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-white/25 text-[12px]">
      <motion.div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-2xl"
        animate={reduceMotion ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }}>⚡</motion.div>
      Select a workflow to view details
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <motion.div className="w-7 h-7 rounded-full border-2 border-[#c4a8ff]/30 border-t-[#c4a8ff]"
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    </div>
  );

  if (!workflow) return null;

  const steps: StepRun[] = run?.steps ?? workflow.steps.map((s) => ({
    stepId: s.id, status: "pending" as WorkflowStatus, startedAt: "",
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-white/90 tracking-tight">{workflow.name}</div>
          <div className="text-[11px] text-white/35 mt-0.5">
            Trigger: {workflow.trigger.type}
            {workflow.trigger.type === "schedule" && ` · ${workflow.trigger.cron}`}
            {run && ` · Started ${new Date(run.startedAt).toLocaleTimeString()}`}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {run && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              run.status === "completed" ? "border-[#a0f0c0]/40 text-[#a0f0c0] bg-[rgba(160,240,192,0.1)] shadow-[0_0_8px_rgba(160,240,192,0.3)]" :
              run.status === "failed"    ? "border-[#f0a0a8]/40 text-[#f0a0a8] bg-[rgba(240,160,168,0.1)]" :
              run.status === "running"   ? "border-[#c4a8ff]/40 text-[#c4a8ff] bg-[rgba(196,168,255,0.1)] animate-pulse" :
              "border-white/10 text-white/35"
            }`}>
              {run.status.toUpperCase()}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 16px rgba(196,168,255,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRerun} disabled={running}
            className="text-[11px] px-3 py-1.5 rounded-full border border-[#c4a8ff]/40 text-[#c4a8ff] bg-[rgba(196,168,255,0.08)] hover:bg-[rgba(196,168,255,0.15)] disabled:opacity-40 backdrop-blur-xl transition-all"
          >
            {running ? "Running…" : "▶ Re-run"}
          </motion.button>
        </div>
      </div>

      {rerunError && (
        <div className="mx-5 mb-2 px-3 py-1.5 rounded-lg border border-[#f0a0a8]/30 bg-[rgba(240,160,168,0.08)] text-[11px] text-[#f0a0a8] flex-shrink-0">
          {rerunError}
        </div>
      )}

      <div className="flex items-center justify-between px-5 pb-2 flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">Execution Trace</span>
        <span className="text-[10px] text-white/20">Click a step to expand</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col">
          {steps.map((step, i) => {
            const def = workflow.steps.find((s) => s.id === step.stepId);
            const style = STEP[step.status] ?? STEP.pending;
            const isExpanded = expandedStep === step.stepId;
            const isRunning = step.status === "running";
            const isFailed = step.status === "failed";

            return (
              <div key={step.stepId} className="flex gap-3 py-2 relative cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : step.stepId)}>
                {i < steps.length - 1 && (
                  <div className="absolute left-[16px] top-9 w-px bottom-0 bg-white/[0.07]" />
                )}
                <div className="relative flex-shrink-0 mt-0.5">
                  {isRunning && !reduceMotion && [
                    { scale: 1.6, opacity: 0.5, delay: 0 },
                    { scale: 2.2, opacity: 0.25, delay: 0.4 },
                    { scale: 2.8, opacity: 0.1, delay: 0.8 },
                  ].map((r, ri) => (
                    <motion.div key={ri} className="absolute inset-0 rounded-full border border-[#c4a8ff]/40"
                      animate={{ scale: [1, r.scale], opacity: [r.opacity, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: r.delay, ease: "easeOut" }} />
                  ))}
                  <motion.div
                    className={`w-[32px] h-[32px] rounded-full border-2 flex items-center justify-center text-[11px] font-bold z-10 relative ${style.ring} ${style.glow}`}
                    style={{ background: "rgba(13,10,20,0.75)" }}
                    animate={isFailed && !reduceMotion ? { x: [0, -3, 3, -2, 2, 0] } : {}}
                    transition={isFailed ? { duration: 0.4 } : {}}
                  >
                    <span className={style.text}>{style.icon}</span>
                  </motion.div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-white/82">{def?.type ?? step.stepId}</span>
                    <span className="text-[10px] text-white/28 font-mono">{step.stepId}</span>
                    {step.completedAt && step.startedAt && (
                      <span className="text-[10px] text-white/22 ml-auto">
                        {new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()}ms
                      </span>
                    )}
                  </div>
                  {step.error && <div className="text-[10px] text-[#f0a0a8] mt-0.5">{step.error}</div>}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl text-[11px] text-white/45 leading-relaxed space-y-1">
                          <div><span className="text-white/65 font-medium">Step:</span> {i + 1} / {steps.length}</div>
                          <div><span className="text-white/65 font-medium">Type:</span> {def?.type ?? "unknown"}</div>
                          {step.startedAt && <div><span className="text-white/65 font-medium">Started:</span> {new Date(step.startedAt).toLocaleTimeString()}</div>}
                          {step.output !== undefined && <div><span className="text-white/65 font-medium">Output:</span> {JSON.stringify(step.output)}</div>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
