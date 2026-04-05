
import { Agent, AgentInput, AgentOutput } from "../../core/interfaces/Agent";

export class ContextAgent implements Agent {
  id = "context";
  name = "ContextAgent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    return {
      success: true,
      logs: ["context agent executed"],
      data: input.context
    };
  }
}
