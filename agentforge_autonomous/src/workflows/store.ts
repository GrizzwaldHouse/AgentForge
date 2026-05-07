import { randomUUID } from 'crypto';
import type { WorkflowDefinition } from './types';

let workflows: WorkflowDefinition[] = [];

export class WorkflowStore {
  create(data: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): WorkflowDefinition {
    const now = new Date().toISOString();
    const workflow: WorkflowDefinition = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    workflows.push(workflow);
    return workflow;
  }

  get(id: string): WorkflowDefinition | null {
    return workflows.find((w) => w.id === id) ?? null;
  }

  list(): WorkflowDefinition[] {
    return [...workflows];
  }

  update(id: string, updates: Partial<Omit<WorkflowDefinition, 'id' | 'createdAt'>>): WorkflowDefinition | null {
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) return null;
    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return workflows[index];
  }

  delete(id: string): boolean {
    const index = workflows.findIndex((w) => w.id === id);
    if (index === -1) return false;
    workflows.splice(index, 1);
    return true;
  }
}

export const workflowStore = new WorkflowStore();
