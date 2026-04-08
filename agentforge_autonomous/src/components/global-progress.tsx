"use client";

import { motion } from "framer-motion";
import type { ProgressState } from "@/lib/progress";

interface GlobalProgressBarProps {
  progress: ProgressState;
}

export function GlobalProgressBar({ progress }: GlobalProgressBarProps) {
  const {
    globalProgress,
    currentStep,
    totalSteps,
    currentStepName,
    isRunning,
    isComplete,
  } = progress;

  const label = isComplete
    ? "Complete"
    : isRunning && currentStepName
      ? `Step ${currentStep} of ${totalSteps}: ${currentStepName}`
      : isRunning
        ? `Step ${currentStep} of ${totalSteps}`
        : "Idle";

  return (
    <div className="global-progress px-4 py-2 border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="text-xs text-[var(--text-secondary)]">
          {globalProgress}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: isComplete
              ? "var(--accent-green)"
              : "var(--accent-blue)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${globalProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
