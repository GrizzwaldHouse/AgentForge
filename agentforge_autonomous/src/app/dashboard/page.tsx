"use client";

import { useState, useMemo, useCallback } from "react";
import { useAgentEvents } from "@/hooks/use-agent-events";
import { allAgents } from "@/agents/registry";
import { DashboardHeader } from "@/components/dashboard-header";
import { AgentCard, type AgentStatus } from "@/components/agent-card";
import { TaskListPanel, type TaskItem, type TaskStatus } from "@/components/task-list";
import { AgentFlowView } from "@/components/agent-flow-view";
import { GlobalProgressBar } from "@/components/global-progress";
import { RightPanel } from "@/components/right-panel";
import { FloatingProgress } from "@/components/floating-progress";
import { InlineTaskInput } from "@/components/inline-task-input";
import { StatusBanners } from "@/components/status-banners";
import { narrativeMap } from "@/lib/narrative";
import { deriveProgress } from "@/lib/progress";
import { runPipeline } from "@/lib/run-pipeline";
import type { AgentEvent } from "@/core/events/types";

const AGENT_IDS = allAgents.map((a) => a.id);

// Derive agent status from event stream
function deriveAgentState(events: AgentEvent[]) {
  const state = new Map<string, { status: AgentStatus; lastRunAt: number | null; lastDurationMs: number | null }>();

  // Initialize all known agents
  for (const agent of allAgents) {
    state.set(agent.id, { status: "idle", lastRunAt: null, lastDurationMs: null });
  }

  // Walk events to build current state
  for (const event of events) {
    if (!("agentId" in event)) continue;
    const agentId = event.agentId;
    const current = state.get(agentId) ?? { status: "idle" as AgentStatus, lastRunAt: null, lastDurationMs: null };

    switch (event.type) {
      case "agent:start":
        current.status = "running";
        break;
      case "agent:complete":
        current.status = "idle";
        current.lastRunAt = event.timestamp;
        current.lastDurationMs = event.durationMs;
        break;
      case "agent:error":
        current.status = "error";
        current.lastRunAt = event.timestamp;
        break;
    }

    state.set(agentId, current);
  }

  return state;
}

// Derive tasks from events (session events carry task info)
function deriveTasks(events: AgentEvent[]): TaskItem[] {
  const tasks = new Map<string, TaskItem>();
  let activeTaskId: string | null = null;

  for (const event of events) {
    // session:end has no taskId — mark the active task as done
    if (event.type === "session:end") {
      if (activeTaskId) {
        const task = tasks.get(activeTaskId);
        if (task && task.status !== "BLOCKED") task.status = "DONE";
        activeTaskId = null;
      }
      continue;
    }

    if (!("taskId" in event) || !event.taskId) continue;
    const taskId = event.taskId;

    if (!tasks.has(taskId)) {
      tasks.set(taskId, { id: taskId, label: taskId, status: "PENDING" });
    }

    const task = tasks.get(taskId)!;

    switch (event.type) {
      case "agent:start":
      case "session:start":
        if (task.status === "PENDING") task.status = "IN_PROGRESS";
        activeTaskId = taskId;
        break;
      case "agent:complete":
        if (event.success) task.status = "REVIEW";
        break;
      case "agent:error":
        task.status = "BLOCKED";
        break;
    }

    if ("agentId" in event) task.agentId = event.agentId;
  }

  return Array.from(tasks.values());
}

export default function DashboardPage() {
  const { events, status, clearEvents } = useAgentEvents();
  const [taskFilter, setTaskFilter] = useState<TaskStatus | null>(null);

  const agentState = useMemo(() => deriveAgentState(events), [events]);
  const tasks = useMemo(() => deriveTasks(events), [events]);
  const progressState = useMemo(() => deriveProgress(events, AGENT_IDS), [events]);

  const narrativeEntries = useMemo(
    () => events.map(narrativeMap).filter((e): e is NonNullable<typeof e> => e !== null),
    [events],
  );

  // Pipeline is running between session:start and session:end
  const pipelineRunning = useMemo(() => {
    let running = false;
    for (const event of events) {
      if (event.type === "session:start") running = true;
      else if (event.type === "session:end") running = false;
    }
    return running;
  }, [events]);

  const completedAgentIds = useMemo(() => {
    const set = new Set<string>();
    progressState.agentProgress.forEach((ap, id) => {
      if (ap.status === "complete") set.add(id);
    });
    return set;
  }, [progressState]);

  const errorAgentIds = useMemo(() => {
    const set = new Set<string>();
    progressState.agentProgress.forEach((ap, id) => {
      if (ap.status === "error") set.add(id);
    });
    return set;
  }, [progressState]);

  // Show the inline CTA when there are no events and nothing is running
  const showInlineCTA = events.length === 0 && !pipelineRunning;

  const handleInlineSubmit = useCallback(async (description: string) => {
    await runPipeline(description);
  }, []);

  // Collect the most recent agent error message for prominent display
  const lastError = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.type === "agent:error") {
        return { agentId: e.agentId, error: e.error };
      }
    }
    return null;
  }, [events]);

  // Pipeline starting but no agent-level events yet (delay between Run click and first event)
  const pipelineStarting = pipelineRunning && !events.some(
    (e) => e.type === "agent:start" || e.type === "agent:progress",
  );

  return (
    <>
      <DashboardHeader
        connectionStatus={status}
        eventCount={events.length}
        pipelineRunning={pipelineRunning}
        onClear={clearEvents}
      />

      <StatusBanners
        connectionStatus={status}
        pipelineStarting={pipelineStarting}
        lastError={lastError}
      />

      {/* Agent flow visualization */}
      <AgentFlowView
        agentIds={AGENT_IDS}
        completedIds={completedAgentIds}
        activeId={progressState.currentAgentId}
        errorIds={errorAgentIds}
        hasRun={events.length > 0}
      />

      {/* Global progress bar */}
      <GlobalProgressBar progress={progressState} />

      {/* Inline CTA — primary action when dashboard is empty */}
      {showInlineCTA && (
        <InlineTaskInput onSubmit={handleInlineSubmit} />
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-0 min-h-0">
        {/* Left panel: Agent cards + Task list */}
        <div className="flex flex-col overflow-hidden">
          {/* Agent cards */}
          <section className="p-4 border-b border-[var(--border-color)]">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Agents
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allAgents.map((agent) => {
                const s = agentState.get(agent.id);
                const ap = progressState.agentProgress.get(agent.id);
                return (
                  <AgentCard
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    status={s?.status ?? "idle"}
                    lastRunAt={s?.lastRunAt}
                    lastDurationMs={s?.lastDurationMs}
                    progress={ap?.status === "running" ? ap.progress : undefined}
                  />
                );
              })}
            </div>
          </section>

          {/* Task list */}
          <section className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Tasks
            </h2>
            <TaskListPanel
              tasks={tasks}
              filter={taskFilter}
              onFilterChange={setTaskFilter}
            />
          </section>
        </div>

        {/* Right panel: Tabbed view (Narrative, Logs, Reasoning, Outputs) */}
        <aside className="border-l border-[var(--border-color)] flex flex-col min-h-0">
          <RightPanel
            narrativeEntries={narrativeEntries}
            events={events}
          />
        </aside>
      </div>

      {/* Floating progress widget */}
      <FloatingProgress progress={progressState} />
    </>
  );
}
