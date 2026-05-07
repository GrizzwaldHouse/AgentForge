"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animation-variants";
import type { ValidationResult, ValidationCheck } from "@/workflows/types";

interface Props { workflowId: string | null; }

const CHECK_STYLE: Record<ValidationCheck["status"], { border: string; icon: string; iconCls: string; badgeCls: string; glow: string }> = {
  pass: { border: "border-l-[#a0f0c0]", icon: "✓", iconCls: "bg-[rgba(160,240,192,0.15)] text-[#a0f0c0]", badgeCls: "bg-[rgba(160,240,192,0.12)] text-[#a0f0c0] shadow-[0_0_8px_rgba(160,240,192,0.3)]", glow: "" },
  warn: { border: "border-l-[#f0dba0]", icon: "⚠", iconCls: "bg-[rgba(240,219,160,0.15)] text-[#f0dba0]", badgeCls: "bg-[rgba(240,219,160,0.12)] text-[#f0dba0] shadow-[0_0_8px_rgba(240,219,160,0.3)]", glow: "" },
  fail: { border: "border-l-[#f0a0a8]", icon: "✕", iconCls: "bg-[rgba(240,160,168,0.15)] text-[#f0a0a8]", badgeCls: "bg-[rgba(240,160,168,0.12)] text-[#f0a0a8] shadow-[0_0_8px_rgba(240,160,168,0.3)]", glow: "bg-[rgba(240,160,168,0.03)]" },
};

export function ValidationPanel({ workflowId }: Props) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchValidation() {
    if (!workflowId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/validate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
      } else {
        setResult(data as ValidationResult);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally { setLoading(false); }
  }

  async function handleApproveAndRun() {
    if (!workflowId) return;
    setApproving(true);
    try {
      await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backend: "orchestrator" }),
      });
    } catch { /* no-op */ } finally { setApproving(false); }
  }

  useEffect(() => {
    if (workflowId) fetchValidation();
    else setResult(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  if (!workflowId) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-white/25 text-[12px]">
      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">✓</div>
      Select a workflow to validate
    </div>
  );

  const passCount = result?.checks.filter((c) => c.status === "pass").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "warn").length ?? 0;
  const failCount = result?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Score summary */}
      {result && (
        <div className="flex gap-2 px-3 pt-3 pb-2 flex-wrap flex-shrink-0">
          {[
            { count: passCount, cls: "bg-[rgba(160,240,192,0.12)] text-[#a0f0c0] shadow-[0_0_8px_rgba(160,240,192,0.25)]", label: "Pass" },
            { count: warnCount, cls: "bg-[rgba(240,219,160,0.12)] text-[#f0dba0] shadow-[0_0_8px_rgba(240,219,160,0.25)]", label: "Warn" },
            { count: failCount, cls: "bg-[rgba(240,160,168,0.12)] text-[#f0a0a8] shadow-[0_0_8px_rgba(240,160,168,0.25)]", label: "Fail" },
          ].map(({ count, cls, label }) => (
            <span key={label} className={`px-3 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
              {count} {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center px-3 pb-2 flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/28">Validation Agent Output</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {loading && (
          <div className="flex justify-center py-8">
            <motion.div className="w-6 h-6 rounded-full border-2 border-[#c4a8ff]/30 border-t-[#c4a8ff]"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
        )}
        {error && <p className="text-[11px] text-[#f0a0a8] text-center py-4">{error}</p>}
        {!loading && result && result.checks.length === 0 && (
          <p className="text-[11px] text-white/25 text-center py-6">{result.passed ? "All checks passed." : "No checks returned."}</p>
        )}

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2">
          <AnimatePresence>
            {result?.checks.map((check, i) => {
              const s = CHECK_STYLE[check.status];
              return (
                <motion.div key={i} variants={fadeInUp} layout
                  className={`flex items-start gap-2.5 p-3 rounded-xl border-l-2 border border-white/[0.08] backdrop-blur-xl ${s.border} ${s.glow}`}
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${s.iconCls}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-white/82">{check.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{check.reason}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 ${s.badgeCls}`}>
                    {check.status.toUpperCase()}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex gap-2 p-3 border-t border-white/[0.07] flex-shrink-0">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={fetchValidation} disabled={loading}
          className="flex-1 text-[11px] py-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] text-white/55 disabled:opacity-35 hover:border-white/20 transition-all backdrop-blur-xl">
          ↻ Re-validate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(196,168,255,0.5)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleApproveAndRun} disabled={approving || !result?.passed}
          className="flex-1 text-[11px] py-1.5 rounded-xl border border-[rgba(196,168,255,0.45)] text-white/88 disabled:opacity-35 transition-all backdrop-blur-xl"
          style={{ background: "linear-gradient(135deg, rgba(196,168,255,0.22), rgba(168,216,200,0.15))" }}>
          {approving ? "Running…" : "✓ Approve & Run"}
        </motion.button>
      </div>
    </div>
  );
}
