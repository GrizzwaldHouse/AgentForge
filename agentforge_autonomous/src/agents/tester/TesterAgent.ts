import { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";

export class TesterAgent implements Agent {
  id = "tester";
  name = "TesterAgent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    return {
      success: true,
      logs: ["tester agent executed"],
      data: input.context,
    };
  }
}
