import { AgentInput, AgentOutput } from '@/core/interfaces/Agent';
import { Task } from '@/core/entities/Task';

export interface ExecutionBackend {
  execute(task: Task): Promise<AgentOutput>;
  cancel(taskId: string): void;
  status(taskId: string): 'running' | 'completed' | 'cancelled';
}

export type BackendOptions = {
  agentInput: AgentInput;
};

export abstract class AbstractExecutionBackend implements ExecutionBackend {
  protected options: BackendOptions;

  constructor(options: BackendOptions) {
    this.options = options;
  }

  abstract execute(task: Task): Promise<AgentOutput>;
  abstract cancel(taskId: string): void;
  abstract status(taskId: string): 'running' | 'completed' | 'cancelled';
}