import type { Agent } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { PlannerAgent } from "./planner/PlannerAgent";
import { BuilderAgent } from "./builder/BuilderAgent";
import { ReviewerAgent } from "./reviewer/ReviewerAgent";
import { TesterAgent } from "./tester/TesterAgent";
import { LearningAgent } from "./learning/LearningAgent";
import { ContextManagerAgent } from "./context/ContextManagerAgent";

// Default: no backend injected (prompt-only mode)
// Call createAgents(backend) to inject a real backend
export function createAgents(backend?: ExecutionBackend): Agent[] {
  return [
    new PlannerAgent(backend),
    new BuilderAgent(backend),
    new ReviewerAgent(backend),
    new TesterAgent(backend),
    new LearningAgent(backend),
    new ContextManagerAgent(backend),
  ];
}

// Default instances (no backend — used by dashboard and initial setup)
export const allAgents: Agent[] = createAgents();

export const agentRegistry = new Map<string, Agent>(
  allAgents.map((a) => [a.id, a])
);
