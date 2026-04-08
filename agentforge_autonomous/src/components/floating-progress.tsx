"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_COLORS } from "@/lib/constants";
import type { ProgressState } from "@/lib/progress";

interface FloatingProgressProps {
  progress: ProgressState;
}

export function FloatingProgress({ progress }: FloatingProgressProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show if idle
  if (!progress.isRunning && !progress.isComplete) {
    return null;
  }

  const currentAgentName = progress.currentAgentId
    ? progress.currentAgentId.charAt(0).toUpperCase() + progress.currentAgentId.slice(1)
    : "Unknown";

  const agentColor = progress.currentAgentId
    ? AGENT_COLORS[progress.currentAgentId] ?? "#888888"
    : "#888888";

  const statusText = progress.isComplete
    ? "Session Complete"
    : progress.currentStepName
      ? `Running step ${progress.currentStep}/${progress.totalSteps}: ${progress.currentStepName}`
      : `Running step ${progress.currentStep}/${progress.totalSteps}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 right-4 z-50"
        style={{ width: isCollapsed ? "64px" : "280px" }}
      >
        <div
          className="rounded-lg border backdrop-blur-md shadow-lg overflow-hidden"
          style={{
            backgroundColor: "rgba(10, 10, 15, 0.9)",
            borderColor: "var(--border-color)",
          }}
        >
          {isCollapsed ? (
            // Collapsed view: circular progress only
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-16 h-16 flex items-center justify-center relative"
              aria-label="Expand progress widget"
            >
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={agentColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(progress.globalProgress / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute text-xs font-semibold"
                style={{ color: agentColor }}
              >
                {progress.globalProgress}%
              </span>
            </button>
          ) : (
            // Expanded view
            <div className="p-4 space-y-3">
              {/* Header with agent name and collapse button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: agentColor }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {currentAgentName}
                  </span>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Collapse progress widget"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: agentColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.globalProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Status text */}
              <p className="text-xs text-[var(--text-secondary)] leading-tight">
                {statusText}
              </p>

              {/* Progress percentage */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  Progress
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: agentColor }}
                >
                  {progress.globalProgress}%
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
