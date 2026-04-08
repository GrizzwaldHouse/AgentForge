"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

interface InlineTaskInputProps {
  onSubmit: (description: string) => void;
}

export function InlineTaskInput({ onSubmit }: InlineTaskInputProps) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus when mounted
    const timer = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = description.trim();
      if (!trimmed || submitting) return;
      setSubmitting(true);
      onSubmit(trimmed);
      // Don't reset — the CTA will unmount once events start arriving
    },
    [description, submitting, onSubmit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const trimmed = description.trim();
        if (trimmed && !submitting) {
          setSubmitting(true);
          onSubmit(trimmed);
        }
      }
    },
    [description, submitting, onSubmit],
  );

  return (
    <div className="px-6 py-8 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6"
      >
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">
          What would you like to build?
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Describe a task and the agent pipeline will plan, build, review, and test it.
        </p>

        <textarea
          ref={textareaRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Create a REST API for user authentication with JWT tokens..."
          rows={4}
          disabled={submitting}
          className={cn(
            "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
            "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
            "focus:outline-none focus:border-[var(--accent-blue)] resize-y",
            "disabled:opacity-50",
          )}
        />

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-[var(--text-secondary)]">
            Ctrl+Enter to submit
          </span>
          <button
            type="submit"
            disabled={!description.trim() || submitting}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded",
              "bg-[var(--accent-blue)] text-white",
              "hover:brightness-110 transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              submitting && "animate-pulse",
            )}
          >
            {submitting ? "Starting..." : "Run Pipeline"}
          </button>
        </div>
      </form>
    </div>
  );
}
