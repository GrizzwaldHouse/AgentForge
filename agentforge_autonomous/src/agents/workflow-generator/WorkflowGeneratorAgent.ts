import type { Agent, AgentInput, AgentOutput } from '@/core/interfaces/Agent';
import type { ExecutionBackend } from '@/backend/execution/ExecutionBackend';
import { agentEventBus } from '@/core/events/agent-event-bus';
import { createEventId } from '@/core/events/types';
import { EVENT_TYPES } from '@/lib/constants';
import { emitProgress } from '@/agents/progress-helper';
import { LLMProviderChain } from '@/backend/services/LLMProviderChain';
import { validateWorkflow } from '@/workflows/schema';
import { randomUUID } from 'crypto';

const SYSTEM_PROMPT = [
  'You are a workflow generation engine.',
  'Given a natural-language intent, produce a WorkflowDefinition JSON object.',
  'You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no code fences.',
  'Required schema:',
  '{',
  '  "id": "<uuid>",',
  '  "name": "<short workflow name>",',
  '  "version": "1.0.0",',
  '  "trigger": { "type": "manual" | "schedule" | "event", ...fields },',
  '  "steps": [{ "type": "scrape"|"filter"|"apply"|"store"|"notify", "id": "<step-id>", ...fields }],',
  '  "metadata": {},',
  '  "createdAt": "<ISO datetime>",',
  '  "updatedAt": "<ISO datetime>"',
  '}',
  'Trigger types: manual (no extra fields), schedule (cron: string, timezone?: string), event (eventType: string, filter?: object).',
  'Step types: scrape (source: string, selector?: string, limit?: number), filter (field, operator: eq|neq|contains|gt|lt, value), apply (transform: string, params?: object), store (destination: string, format?: json|csv|text), notify (channel: string, template?: string).',
  'All steps require a unique "id" field.',
  'Output ONLY the JSON. Nothing else.',
].join('\n');

export class WorkflowGeneratorAgent implements Agent {
  id = 'workflow-generator';
  name = 'WorkflowGeneratorAgent';

  private llm: LLMProviderChain;

  constructor(private backend?: ExecutionBackend) {
    this.llm = new LLMProviderChain();
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const logs: string[] = [];
    const intent =
      typeof input.context.intent === 'string'
        ? input.context.intent
        : JSON.stringify(input.context);

    logs.push(`Generating workflow for intent: ${intent.slice(0, 120)}`);

    emitProgress({
      sessionId: '',
      agentId: this.id,
      taskId: input.taskId,
      progress: 10,
      humanMessage: 'Generating workflow from intent...',
      stepName: 'WorkflowGeneration',
    });

    try {
      const now = new Date().toISOString();
      const promptWithDefaults = [
        `Intent: ${intent}`,
        `Use id: "${randomUUID()}", createdAt: "${now}", updatedAt: "${now}".`,
      ].join('\n');

      const result = await this.llm.chat(promptWithDefaults, SYSTEM_PROMPT);
      logs.push(`LLM response via ${result.provider} (${result.latencyMs}ms, ${result.tokensUsed} tokens)`);

      emitProgress({
        sessionId: '',
        agentId: this.id,
        taskId: input.taskId,
        progress: 70,
        humanMessage: 'Validating generated workflow...',
        stepName: 'WorkflowGeneration',
      });

      let parsed: unknown;
      try {
        parsed = JSON.parse(result.response);
      } catch {
        logs.push('LLM output was not valid JSON');
        return { success: false, logs, data: { error: 'LLM output was not valid JSON', raw: result.response } };
      }

      const workflow = validateWorkflow(parsed);
      logs.push(`Workflow validated: ${workflow.name} (${workflow.steps.length} steps)`);

      agentEventBus.emit({
        id: createEventId(),
        type: EVENT_TYPES.AGENT_LOG,
        timestamp: Date.now(),
        sessionId: '',
        agentId: this.id,
        taskId: input.taskId,
        message: `Workflow generated: ${workflow.name}`,
        level: 'info',
        humanMessage: `Workflow generated: ${workflow.name}`,
      });

      emitProgress({
        sessionId: '',
        agentId: this.id,
        taskId: input.taskId,
        progress: 100,
        humanMessage: `Workflow "${workflow.name}" ready.`,
        stepName: 'WorkflowGeneration',
      });

      return { success: true, logs, data: { workflow } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logs.push(`Workflow generation failed: ${message}`);
      return { success: false, logs, data: { error: message } };
    }
  }
}
