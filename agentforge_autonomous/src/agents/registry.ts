import type { Agent } from "@/core/interfaces/Agent";
import { PlannerAgent } from "./planner/PlannerAgent";
import { BuilderAgent } from "./builder/BuilderAgent";
import { ReviewerAgent } from "./reviewer/ReviewerAgent";
import { TesterAgent } from "./tester/TesterAgent";
import { LearningAgent } from "./learning/LearningAgent";
import { ContextManagerAgent } from "./context/ContextManagerAgent";

export const allAgents: Agent[] = [
  new PlannerAgent(),
  new BuilderAgent(),
  new ReviewerAgent(),
  new TesterAgent(),
  new LearningAgent(),
  new ContextManagerAgent(),
];

export const agentRegistry = new Map<string, Agent>(
  allAgents.map((a) => [a.id, a])
);
