"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/workflows/GlassPanel";

interface PackageTabProps {
  onGenerate: (payload: {
    taskType: string;
    prompt: string;
    systemPrompt: string;
  }) => void;
  generating: boolean;
  result: string | null;
}

const SYSTEM_PROMPT =
  "You are an expert at structuring freelance service packages. Create three clearly scoped tiers (Starter, Professional, Premium) with specific deliverables, turnaround times, revision counts, and prices. Make each tier feel like a natural upgrade rather than an arbitrary upsell.";

const TIER_COUNTS = ["2 tiers", "3 tiers", "4 tiers"] as const;
type TierCount = (typeof TIER_COUNTS)[number];

export function PackageTab({ onGenerate, generating, result }: PackageTabProps) {
  const [serviceDescription, setServiceDescription] = useState("");
  const [tierCount, setTierCount] = useState<TierCount>("3 tiers");
  const [priceRange, setPriceRange] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedService = serviceDescription.trim();
      if (!trimmedService || generating) return;

      const priceHint = priceRange.trim()
        ? `\nTarget price range: ${priceRange.trim()}`
        : "";
      const prompt = `Service: ${trimmedService}\nNumber of tiers: ${tierCount}${priceHint}`;

      onGenerate({ taskType: "package", prompt, systemPrompt: SYSTEM_PROMPT });
    },
    [serviceDescription, tierCount, priceRange, generating, onGenerate],
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <GlassPanel className="p-5" glow>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Service Description
            </label>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="e.g. UE5 gameplay mechanic implementation, full-stack Next.js web app, AI chatbot integration..."
              rows={4}
              disabled={generating}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                "focus:outline-none focus:border-[var(--accent-blue)] resize-y",
                "disabled:opacity-50",
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Number of Tiers
              </label>
              <select
                value={tierCount}
                onChange={(e) => setTierCount(e.target.value as TierCount)}
                disabled={generating}
                className={cn(
                  "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                  "text-sm text-[var(--text-primary)]",
                  "focus:outline-none focus:border-[var(--accent-blue)]",
                  "disabled:opacity-50",
                )}
              >
                {TIER_COUNTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Price Range <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="e.g. $500 - $3,000"
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!serviceDescription.trim() || generating}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded",
                "bg-[var(--accent-blue)] text-white",
                "hover:brightness-110 transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                generating && "animate-pulse",
              )}
            >
              {generating ? "Generating..." : "Generate Package"}
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
              Generated Package
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
