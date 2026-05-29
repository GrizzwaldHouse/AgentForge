"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/workflows/GlassPanel";

interface ProposalTabProps {
  onGenerate: (payload: {
    taskType: string;
    prompt: string;
    systemPrompt: string;
  }) => void;
  generating: boolean;
  result: string | null;
}

const SYSTEM_PROMPT =
  "You are an expert freelance proposal writer. Write a concise, compelling proposal tailored to the job description. Lead with the client's problem, demonstrate relevant experience, and close with a clear next step. Keep it under 300 words.";

export function ProposalTab({ onGenerate, generating, result }: ProposalTabProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedJob = jobDescription.trim();
      if (!trimmedJob || generating) return;

      const prompt = context.trim()
        ? `Job Description:\n${trimmedJob}\n\nAdditional Context:\n${context.trim()}`
        : `Job Description:\n${trimmedJob}`;

      onGenerate({ taskType: "proposal", prompt, systemPrompt: SYSTEM_PROMPT });
    },
    [jobDescription, context, generating, onGenerate],
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <GlassPanel className="p-5" glow>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job listing here..."
              rows={6}
              disabled={generating}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                "focus:outline-none focus:border-[var(--accent-blue)] resize-y",
                "disabled:opacity-50",
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Additional Context <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Your relevant experience, rate, availability..."
              rows={3}
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
              disabled={!jobDescription.trim() || generating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded",
                "bg-[var(--accent-blue)] text-white",
                "hover:brightness-110 transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                generating && "animate-pulse",
              )}
            >
              {generating ? "Generating..." : "Generate Proposal"}
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
              Generated Proposal
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
