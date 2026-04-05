import { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";

export class ContextManagerAgent implements Agent {
  id = "context";
  name = "ContextManagerAgent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs = [...new Set(input.context.logs || [])].slice(-100);
    const history = (input.context.history || []).slice(-20);

    return {
      success: true,
      logs: ["Context pruned"],
      data: { ...input.context, logs, history },
    };
  }
}
