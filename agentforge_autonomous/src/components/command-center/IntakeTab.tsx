"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/workflows/GlassPanel";

interface IntakeTabProps {
  onGenerate: (payload: {
    taskType: string;
    prompt: string;
    systemPrompt: string;
  }) => void;
  generating: boolean;
  result: string | null;
}

const SYSTEM_PROMPT =
  "You are an expert freelance consultant. Given a client brief, produce a structured intake summary with: project goal, target audience, key deliverables, technical constraints, open questions that need client answers, and recommended next steps. Be direct and specific. Flag any ambiguities that could cause scope creep.";

export function IntakeTab({ onGenerate, generating, result }: IntakeTabProps) {
  const [clientBrief, setClientBrief] = useState("");
  const [serviceType, setServiceType] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedBrief = clientBrief.trim();
      if (!trimmedBrief || generating) return;

      const serviceHint = serviceType.trim()
        ? `Service type: ${serviceType.trim()}\n\n`
        : "";
      const prompt = `${serviceHint}Client Brief:\n${trimmedBrief}`;

      onGenerate({ taskType: "intake", prompt, systemPrompt: SYSTEM_PROMPT });
    },
    [clientBrief, serviceType, generating, onGenerate],
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <GlassPanel className="p-5" glow>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Service Type <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g. UE5 game feature, Next.js web app, AI integration..."
              disabled={generating}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                "focus:outline-none focus:border-[var(--accent-blue)]",
                "disabled:opacity-50",
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Client Brief
            </label>
            <textarea
              value={clientBrief}
              onChange={(e) => setClientBrief(e.target.value)}
              placeholder="Paste the client message, email, or project description here..."
              rows={7}
              disabled={generating}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                "focus:outline-none focus:border-[var(--accent-blue)] resize-y",
                "disabled:opacity-50",
              )}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!clientBrief.trim() || generating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded",
                "bg-[var(--accent-blue)] text-white",
                "hover:brightness-110 transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                generating && "animate-pulse",
              )}
            >
              {generating ? "Analyzing..." : "Analyze Brief"}
            </button>
          </div>
        </form>
      </GlassPanel>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassPanel className="p-5" hover>
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Intake Summary
            </div>
            <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </div>
  );
}
