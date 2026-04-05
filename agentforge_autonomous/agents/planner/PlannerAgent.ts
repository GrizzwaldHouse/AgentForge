
import { Agent, AgentInput, AgentOutput } from "../../core/interfaces/Agent";

export class PlannerAgent implements Agent {
  id = "planner";
  name = "PlannerAgent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    return {
      success: true,
      logs: ["planner agent executed"],
      data: input.context
    };
  }
}
