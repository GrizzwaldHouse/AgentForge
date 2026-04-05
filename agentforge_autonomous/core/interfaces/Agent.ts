
export interface AgentInput {
  taskId: string;
  context: Record<string, any>;
}

export interface AgentOutput {
  success: boolean;
  data?: any;
  logs: string[];
}

export interface Agent {
  id: string;
  name: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}
