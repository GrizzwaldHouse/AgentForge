"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/workflows/GlassPanel";

interface ListingTabProps {
  onGenerate: (payload: {
    taskType: string;
    prompt: string;
    systemPrompt: string;
  }) => void;
  generating: boolean;
  result: string | null;
}

const SYSTEM_PROMPT =
  "You are an expert at writing freelance job listings. Write a clear, specific listing that attracts qualified candidates. Include scope, deliverables, required skills, and timeline. Avoid vague language. Format with short paragraphs and a bullet list of requirements.";

const LISTING_TYPES = ["Upwork", "Toptal", "LinkedIn", "Direct / Custom"] as const;
type ListingType = (typeof LISTING_TYPES)[number];

export function ListingTab({ onGenerate, generating, result }: ListingTabProps) {
  const [projectDescription, setProjectDescription] = useState("");
  const [listingType, setListingType] = useState<ListingType>("Upwork");
  const [budget, setBudget] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedDesc = projectDescription.trim();
      if (!trimmedDesc || generating) return;

      const budgetLine = budget.trim() ? `\nBudget: ${budget.trim()}` : "";
      const prompt = `Platform: ${listingType}${budgetLine}\n\nProject Description:\n${trimmedDesc}`;

      onGenerate({ taskType: "listing", prompt, systemPrompt: SYSTEM_PROMPT });
    },
    [projectDescription, listingType, budget, generating, onGenerate],
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <GlassPanel className="p-5" glow>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Platform
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as ListingType)}
                disabled={generating}
                className={cn(
                  "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                  "text-sm text-[var(--text-primary)]",
                  "focus:outline-none focus:border-[var(--accent-blue)]",
                  "disabled:opacity-50",
                )}
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Budget <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $500-1000 fixed"
                disabled={generating}
                className={cn(
                  "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                  "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                  "focus:outline-none focus:border-[var(--accent-blue)]",
                  "disabled:opacity-50",
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Project Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe what you need built, the deliverables, and any technical requirements..."
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!projectDescription.trim() || generating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded",
                "bg-[var(--accent-blue)] text-white",
                "hover:brightness-110 transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                generating && "animate-pulse",
              )}
            >
              {generating ? "Generating..." : "Generate Listing"}
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
              Generated Listing
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
