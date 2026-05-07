import { z } from 'zod';
import type { WorkflowDefinition } from './types';

const scheduleTriggerSchema = z.object({
  type: z.literal('schedule'),
  cron: z.string().min(1),
  timezone: z.string().optional(),
});

const eventTriggerSchema = z.object({
  type: z.literal('event'),
  eventType: z.string().min(1),
  filter: z.record(z.string(), z.unknown()).optional(),
});

const manualTriggerSchema = z.object({
  type: z.literal('manual'),
});

const triggerDefSchema = z.union([
  scheduleTriggerSchema,
  eventTriggerSchema,
  manualTriggerSchema,
]);

const scrapeStepSchema = z.object({
  type: z.literal('scrape'),
  id: z.string().min(1),
  source: z.string().min(1),
  selector: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

const filterStepSchema = z.object({
  type: z.literal('filter'),
  id: z.string().min(1),
  field: z.string().min(1),
  operator: z.enum(['eq', 'neq', 'contains', 'gt', 'lt']),
  value: z.unknown(),
});

const applyStepSchema = z.object({
  type: z.literal('apply'),
  id: z.string().min(1),
  transform: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

const storeStepSchema = z.object({
  type: z.literal('store'),
  id: z.string().min(1),
  destination: z.string().min(1),
  format: z.enum(['json', 'csv', 'text']).optional(),
});

const notifyStepSchema = z.object({
  type: z.literal('notify'),
  id: z.string().min(1),
  channel: z.string().min(1),
  template: z.string().optional(),
});

const stepDefSchema = z.union([
  scrapeStepSchema,
  filterStepSchema,
  applyStepSchema,
  storeStepSchema,
  notifyStepSchema,
]);

export const workflowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  trigger: triggerDefSchema,
  steps: z.array(stepDefSchema).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export function validateWorkflow(data: unknown): WorkflowDefinition {
  return workflowDefinitionSchema.parse(data) as WorkflowDefinition;
}
