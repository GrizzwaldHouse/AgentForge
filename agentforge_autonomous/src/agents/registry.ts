import type { Agent } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { PlannerAgent } from "./planner/PlannerAgent";
import { BuilderAgent } from "./builder/BuilderAgent";
import { ReviewerAgent } from "./reviewer/ReviewerAgent";
import { TesterAgent } from "./tester/TesterAgent";
import { LearningAgent } from "./learning/LearningAgent";
import { ContextManagerAgent } from "./context/ContextManagerAgent";
import { PipelineAgent } from "./pipeline/PipelineAgent";
import { BrainstormAgent } from "./brainstorm/BrainstormAgent";

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
    new PipelineAgent(),
    new BrainstormAgent(),
  ];
}

// Default instances (no backend — used by dashboard and initial setup)
export const allAgents: Agent[] = [
  new PlannerAgent(),
  new BuilderAgent(),
  new ReviewerAgent(),
  new TesterAgent(),
  new LearningAgent(),
  new ContextManagerAgent(),
  new PipelineAgent(),
  new BrainstormAgent(),
];

export const agentRegistry = new Map<string, Agent>(
  allAgents.map((a) => [a.id, a])
);
