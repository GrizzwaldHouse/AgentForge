"use client";

import { cn } from "@/lib/cn";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

export interface TaskItem {
  id: string;
  label: string;
  status: TaskStatus;
  agentId?: string;
}

const statusBadge: Record<TaskStatus, { bg: string; text: string }> = {
  PENDING:     { bg: "bg-[var(--bg-tertiary)]",   text: "text-[var(--text-secondary)]" },
  IN_PROGRESS: { bg: "bg-[var(--accent-blue)]/15", text: "text-[var(--accent-blue)]" },
  REVIEW:      { bg: "bg-[var(--accent-amber)]/15", text: "text-[var(--accent-amber)]" },
  DONE:        { bg: "bg-[var(--accent-green)]/15", text: "text-[var(--accent-green)]" },
  BLOCKED:     { bg: "bg-[var(--accent-red)]/15",  text: "text-[var(--accent-red)]" },
};

interface TaskListPanelProps {
  tasks: TaskItem[];
  filter?: TaskStatus | null;
  onFilterChange?: (status: TaskStatus | null) => void;
}

const allStatuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"];

export function TaskListPanel({ tasks, filter, onFilterChange }: TaskListPanelProps) {
  const filtered = filter ? tasks.filter((t) => t.status === filter) : tasks;

  return (
    <div className="flex flex-col gap-3">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFilterChange?.(null)}
          className={cn(
            "px-2 py-0.5 text-xs rounded-md border transition-colors",
            !filter
              ? "border-[var(--accent-blue)] text-[var(--accent-blue)]"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]",
          )}
        >
          All ({tasks.length})
        </button>
        {allStatuses.map((s) => {
          const count = tasks.filter((t) => t.status === s).length;
          if (count === 0) return null;
          const { text } = statusBadge[s];
          return (
            <button
              key={s}
              onClick={() => onFilterChange?.(filter === s ? null : s)}
              className={cn(
                "px-2 py-0.5 text-xs rounded-md border transition-colors",
                filter === s
                  ? `border-current ${text}`
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]",
              )}
            >
              {s.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <div className="text-xs text-[var(--text-secondary)] text-center py-4">
            No tasks
          </div>
        )}
        {filtered.map((task) => {
          const badge = statusBadge[task.status];
          return (
            <div
              key={task.id}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-[var(--text-secondary)] font-mono shrink-0">
                  {task.id}
                </span>
                <span className="text-sm truncate">{task.label}</span>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium rounded shrink-0",
                  badge.bg,
                  badge.text,
                )}
              >
                {task.status.replace("_", " ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
