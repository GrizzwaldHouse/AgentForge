import { Agent } from "@/core/interfaces/Agent";

export class AgentOrchestrator {
  constructor(private agents: Agent[]) {}

  async run(task: any) {
    return Promise.all(
      this.agents.map((agent) =>
        agent.execute({
          taskId: task.id,
          context: task.context,
        })
      )
    );
  }
}
