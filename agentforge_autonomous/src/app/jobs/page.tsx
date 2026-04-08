"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { JobApplication, ApplicationStatus, ResumeVariant, WeeklyStats } from "@/job-system/types";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  saved: { label: "Saved", color: "var(--text-secondary)" },
  applied: { label: "Applied", color: "var(--accent-blue)" },
  interview: { label: "Interview", color: "var(--accent-purple)" },
  rejected: { label: "Rejected", color: "var(--accent-red)" },
  offer: { label: "Offer", color: "var(--accent-green)" },
  accepted: { label: "Accepted", color: "var(--accent-green)" },
};

export default function JobsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    url: "",
    source: "",
    resumeVariant: "game-dev" as ResumeVariant,
    notes: "",
  });

  // Load applications and stats
  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then(r => r.json()),
      fetch("/api/jobs/stats").then(r => r.json()),
    ]).then(([apps, st]) => {
      setApplications(apps);
      setStats(st);
      setLoading(false);
    });
  }, []);

  const filteredApps = useMemo(() => {
    if (statusFilter === "all") return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  const dueFollowUps = useMemo(() => {
    const now = new Date();
    return applications.flatMap(app =>
      app.followUps
        .filter(f => !f.completed && new Date(f.date) <= now)
        .map(f => ({ app, followUp: f }))
    );
  }, [applications]);

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        status: "saved",
        appliedAt: null,
      }),
    });

    if (response.ok) {
      const newApp = await response.json();
      setApplications(prev => [...prev, newApp]);
      setFormData({
        company: "",
        role: "",
        url: "",
        source: "",
        resumeVariant: "game-dev",
        notes: "",
      });
      setShowAddForm(false);

      // Refresh stats
      const statsResponse = await fetch("/api/jobs/stats");
      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: ApplicationStatus) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, appliedAt: status === "applied" ? new Date().toISOString() : undefined }),
    });

    if (response.ok) {
      const updated = await response.json();
      setApplications(prev => prev.map(app => app.id === id ? updated : app));

      // Refresh stats
      const statsResponse = await fetch("/api/jobs/stats");
      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with stats */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Job Applications</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded border border-[var(--accent-blue)] text-[var(--accent-blue)] hover:bg-[var(--accent-blue)] hover:text-[var(--bg-primary)] transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Application"}
          </button>
        </div>

        {stats && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">
              This week: <span className={cn("font-bold", stats.goalMet ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]")}>{stats.total}/{stats.goalTarget}</span>
            </span>
            {!stats.goalMet && (
              <span className="text-[var(--accent-amber)] text-xs">
                {stats.goalTarget - stats.total} more needed to meet goal
              </span>
            )}
          </div>
        )}
      </div>

      {/* Due follow-ups */}
      {dueFollowUps.length > 0 && (
        <div className="px-6 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 text-[var(--accent-amber)]">
            <span className="font-semibold">⚠ {dueFollowUps.length} follow-up{dueFollowUps.length > 1 ? "s" : ""} due</span>
          </div>
          <div className="mt-2 space-y-1">
            {dueFollowUps.slice(0, 3).map(({ app, followUp }) => (
              <div key={followUp.id} className="text-xs text-[var(--text-secondary)]">
                {app.company} — {followUp.type} due {new Date(followUp.date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]"
        >
          <form onSubmit={handleAddApplication} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                required
              />
            </div>
            <input
              type="url"
              placeholder="Job URL"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Source (e.g., LinkedIn)"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                required
              />
              <select
                value={formData.resumeVariant}
                onChange={e => setFormData({ ...formData, resumeVariant: e.target.value as ResumeVariant })}
                className="px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="game-dev">Game Dev</option>
                <option value="full-stack">Full Stack</option>
                <option value="ai-ml">AI/ML</option>
                <option value="tools">Tools</option>
              </select>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] h-20 resize-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[var(--accent-blue)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity"
            >
              Add Application
            </button>
          </form>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 px-6 py-3 border-b border-[var(--border-color)] overflow-x-auto">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "px-3 py-1 rounded text-sm transition-colors",
            statusFilter === "all"
              ? "bg-[var(--accent-blue)] text-[var(--bg-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          All ({applications.length})
        </button>
        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1 rounded text-sm transition-colors",
              statusFilter === status
                ? "text-[var(--bg-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            style={statusFilter === status ? { backgroundColor: STATUS_CONFIG[status].color } : undefined}
          >
            {STATUS_CONFIG[status].label} ({applications.filter(a => a.status === status).length})
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredApps.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] py-12">
            No applications yet. Click "Add Application" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{app.company}</h3>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: STATUS_CONFIG[app.status].color, color: "var(--bg-primary)" }}
                        >
                          {STATUS_CONFIG[app.status].label}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] mt-1">{app.role}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {app.source} • {app.resumeVariant}
                        {app.appliedAt && ` • Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span className="text-[var(--text-secondary)]">{expandedId === app.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-[var(--border-color)] p-4 bg-[var(--bg-primary)]"
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-1">URL</div>
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--accent-blue)] hover:underline"
                        >
                          {app.url}
                        </a>
                      </div>

                      {app.notes && (
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] mb-1">Notes</div>
                          <div className="text-sm text-[var(--text-primary)]">{app.notes}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-2">Update Status</div>
                        <div className="flex gap-2 flex-wrap">
                          {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(status => (
                            <button
                              key={status}
                              onClick={() => handleUpdateStatus(app.id, status)}
                              disabled={app.status === status}
                              className={cn(
                                "px-3 py-1 rounded text-xs transition-opacity",
                                app.status === status ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
                              )}
                              style={{ backgroundColor: STATUS_CONFIG[status].color, color: "var(--bg-primary)" }}
                            >
                              {STATUS_CONFIG[status].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
