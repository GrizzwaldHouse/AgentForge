
import { Agent, AgentInput, AgentOutput } from "../../core/interfaces/Agent";

export class ReviewerAgent implements Agent {
  id = "reviewer";
  name = "ReviewerAgent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    return {
      success: true,
      logs: ["reviewer agent executed"],
      data: input.context
    };
  }
}
