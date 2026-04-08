import type { AgentEvent } from "@/core/events/types";

export interface AgentProgressState {
  status: "idle" | "running" | "complete" | "error";
  progress: number; // 0-100
  stepName?: string;
}

export interface ProgressState {
  globalProgress: number; // 0-100
  currentStep: number; // 1-based
  totalSteps: number;
  currentAgentId: string | null;
  currentStepName: string | null;
  agentProgress: Map<string, AgentProgressState>;
  isRunning: boolean;
  isComplete: boolean;
}

const AGENT_STEP_NAMES: Record<string, string> = {
  planner: "Planning",
  builder: "Building",
  reviewer: "Reviewing",
  tester: "Testing",
  learning: "Learning",
  context: "Cleanup",
};

/** Derives pipeline progress state from an event stream and agent ID list. */
export function deriveProgress(
  events: AgentEvent[],
  agentIds: string[],
): ProgressState {
  const totalSteps = agentIds.length;
  const agentProgress = new Map<string, AgentProgressState>();

  // Initialize all agents as idle
  for (const id of agentIds) {
    agentProgress.set(id, { status: "idle", progress: 0 });
  }

  let isRunning = false;
  let isComplete = false;
  let currentAgentId: string | null = null;
  let currentStepName: string | null = null;

  for (const event of events) {
    switch (event.type) {
      case "session:start":
        isRunning = true;
        isComplete = false;
        break;

      case "session:end":
        isRunning = false;
        isComplete = true;
        currentAgentId = null;
        currentStepName = null;
        break;

      case "agent:start": {
        const ap = agentProgress.get(event.agentId);
        if (ap) {
          ap.status = "running";
          ap.progress = 0;
          ap.stepName = event.stepName ?? AGENT_STEP_NAMES[event.agentId];
        }
        currentAgentId = event.agentId;
        currentStepName =
          event.stepName ?? AGENT_STEP_NAMES[event.agentId] ?? null;
        break;
      }

      case "agent:progress": {
        const ap = agentProgress.get(event.agentId);
        if (ap) {
          ap.progress = event.progress;
          if (event.stepName) ap.stepName = event.stepName;
        }
        break;
      }

      case "agent:complete": {
        const ap = agentProgress.get(event.agentId);
        if (ap) {
          ap.status = event.success ? "complete" : "error";
          ap.progress = 100;
        }
        break;
      }

      case "agent:error": {
        const ap = agentProgress.get(event.agentId);
        if (ap) {
          ap.status = "error";
        }
        break;
      }
    }
  }

  // Compute global progress
  let completedCount = 0;
  let currentStep = 1;
  for (let i = 0; i < agentIds.length; i++) {
    const ap = agentProgress.get(agentIds[i]);
    if (ap && (ap.status === "complete" || ap.status === "error")) {
      completedCount++;
      currentStep = i + 2; // next step (1-based)
    }
  }
  currentStep = Math.min(currentStep, totalSteps);

  // If nothing has completed but something is running, we're on step 1
  if (completedCount === 0 && isRunning) {
    currentStep = 1;
  }

  const globalProgress =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return {
    globalProgress,
    currentStep,
    totalSteps,
    currentAgentId,
    currentStepName,
    agentProgress,
    isRunning,
    isComplete,
  };
}
