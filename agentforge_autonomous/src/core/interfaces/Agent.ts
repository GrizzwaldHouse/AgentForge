
export interface AgentInput {
  taskId: string;
  context: Record<string, unknown>;
}

export interface AgentOutput {
  success: boolean;
  data?: unknown;
  logs: string[];
}

export interface Agent {
  id: string;
  name: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}
