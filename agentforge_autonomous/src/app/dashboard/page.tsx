"use client";

import { useState, useMemo } from "react";
import { useAgentEvents } from "@/hooks/use-agent-events";
import { allAgents } from "@/agents/registry";
import { DashboardHeader } from "@/components/dashboard-header";
import { AgentCard, type AgentStatus } from "@/components/agent-card";
import { TaskListPanel, type TaskItem, type TaskStatus } from "@/components/task-list";
import { EventStream } from "@/components/event-stream";
import type { AgentEvent } from "@/core/events/types";

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

  return (
    <>
      <DashboardHeader
        connectionStatus={status}
        eventCount={events.length}
        onClear={clearEvents}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
        {/* Main content */}
        <div className="flex flex-col overflow-hidden">
          {/* Agent cards */}
          <section className="p-4 border-b border-[var(--border-color)]">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Agents
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allAgents.map((agent) => {
                const s = agentState.get(agent.id);
                return (
                  <AgentCard
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    status={s?.status ?? "idle"}
                    lastRunAt={s?.lastRunAt}
                    lastDurationMs={s?.lastDurationMs}
                  />
                );
              })}
            </div>
          </section>

          {/* Event stream */}
          <section className="flex-1 flex flex-col min-h-0 p-4">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Event Stream
            </h2>
            <div className="flex-1 min-h-0 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
              <EventStream events={events} />
            </div>
          </section>
        </div>

        {/* Sidebar — task list */}
        <aside className="border-l border-[var(--border-color)] p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Tasks
          </h2>
          <TaskListPanel
            tasks={tasks}
            filter={taskFilter}
            onFilterChange={setTaskFilter}
          />
        </aside>
      </div>
    </>
  );
}
