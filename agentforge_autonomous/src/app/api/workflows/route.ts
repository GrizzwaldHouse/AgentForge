import { NextRequest, NextResponse } from 'next/server';
import { workflowStore } from '@/workflows/store';
import { WorkflowGeneratorAgent } from '@/agents/workflow-generator/WorkflowGeneratorAgent';
import { validateWorkflow } from '@/workflows/schema';
import { randomUUID } from 'crypto';

let activeGenerations = 0;
const MAX_CONCURRENT_GENERATIONS = 2;

export async function GET() {
  return NextResponse.json(workflowStore.list());
}

export async function POST(request: NextRequest) {
  if (activeGenerations >= MAX_CONCURRENT_GENERATIONS) {
    return NextResponse.json(
      { error: 'Too many concurrent workflow generations — try again shortly' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (typeof data.intent !== 'string' || data.intent.trim().length === 0) {
    return NextResponse.json({ error: 'intent is required and must be a non-empty string' }, { status: 400 });
  }

  const intent = data.intent.trim();
  if (intent.length > 2000) {
    return NextResponse.json({ error: 'intent exceeds maximum length of 2000 characters' }, { status: 400 });
  }

  const agent = new WorkflowGeneratorAgent();
  const taskId = `wf_${randomUUID()}`;

  activeGenerations++;
  try {
    const output = await agent.execute({ taskId, context: { intent } });

    if (!output.success || !output.data || typeof output.data !== 'object') {
      const err = (output.data as Record<string, unknown>)?.error ?? 'Workflow generation failed';
      return NextResponse.json({ error: err, logs: output.logs }, { status: 422 });
    }

    const { workflow } = output.data as { workflow: unknown };
    const validated = validateWorkflow(workflow);
    const stored = workflowStore.create({
      name: validated.name,
      version: validated.version,
      trigger: validated.trigger,
      steps: validated.steps,
      metadata: validated.metadata,
    });

    return NextResponse.json({ workflow: stored, logs: output.logs }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/workflows] Generation failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    activeGenerations--;
  }
}
