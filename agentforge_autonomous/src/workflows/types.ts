export type TriggerType = 'schedule' | 'event' | 'manual';
export type StepType = 'scrape' | 'filter' | 'apply' | 'store' | 'notify';
export type WorkflowStatus = 'pending' | 'validated' | 'running' | 'completed' | 'failed';

export interface ScheduleTrigger {
  type: 'schedule';
  cron: string;
  timezone?: string;
}

export interface EventTrigger {
  type: 'event';
  eventType: string;
  filter?: Record<string, unknown>;
}

export interface ManualTrigger {
  type: 'manual';
}

export type TriggerDef = ScheduleTrigger | EventTrigger | ManualTrigger;

export interface ScrapeStep {
  type: 'scrape';
  id: string;
  source: string;
  selector?: string;
  limit?: number;
}

export interface FilterStep {
  type: 'filter';
  id: string;
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt';
  value: unknown;
}

export interface ApplyStep {
  type: 'apply';
  id: string;
  transform: string;
  params?: Record<string, unknown>;
}

export interface StoreStep {
  type: 'store';
  id: string;
  destination: string;
  format?: 'json' | 'csv' | 'text';
}

export interface NotifyStep {
  type: 'notify';
  id: string;
  channel: string;
  template?: string;
}

export type StepDef = ScrapeStep | FilterStep | ApplyStep | StoreStep | NotifyStep;

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  trigger: TriggerDef;
  steps: StepDef[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StepRun {
  stepId: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  steps: StepRun[];
}

export interface ValidationCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  reason: string;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}
