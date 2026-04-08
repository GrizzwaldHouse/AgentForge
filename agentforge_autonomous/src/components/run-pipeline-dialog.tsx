"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import type { BackendMode } from "@/lib/run-pipeline";

interface RunPipelineDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (description: string, backend: BackendMode) => void;
}

export function RunPipelineDialog({ open, onClose, onSubmit }: RunPipelineDialogProps) {
  const [description, setDescription] = useState("");
  const [backend, setBackend] = useState<BackendMode>("auto");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the element is rendered
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = description.trim();
      if (!trimmed) return;
      onSubmit(trimmed, backend);
      setDescription("");
      setBackend("auto");
    },
    [description, backend, onSubmit],
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mx-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Run Pipeline</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Describe what you want the agents to do.
          </p>
        </div>

        {/* Body */}
        <div className="px-5 space-y-4">
          {/* Task description */}
          <div>
            <label
              htmlFor="pipeline-description"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Task description
            </label>
            <textarea
              ref={textareaRef}
              id="pipeline-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want the agents to do..."
              required
              rows={4}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                "focus:outline-none focus:border-[var(--accent-blue)] resize-y",
              )}
            />
          </div>

          {/* Backend selector */}
          <div>
            <label
              htmlFor="pipeline-backend"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Backend
            </label>
            <select
              id="pipeline-backend"
              value={backend}
              onChange={(e) => setBackend(e.target.value as BackendMode)}
              className={cn(
                "w-full rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2",
                "text-sm text-[var(--text-primary)]",
                "focus:outline-none focus:border-[var(--accent-blue)]",
              )}
            >
              <option value="auto">Auto (detect best available)</option>
              <option value="ollama">Ollama (local)</option>
              <option value="simulated">Simulated</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-3 py-1.5 text-xs rounded border border-[var(--border-color)]",
              "text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              "transition-colors",
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!description.trim()}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded",
              "bg-[var(--accent-blue)] text-white",
              "hover:brightness-110 transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            Run Pipeline
          </button>
        </div>
      </form>
    </div>
  );
}
