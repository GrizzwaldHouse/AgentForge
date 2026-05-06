# Agent Contract Map

Use this reference only when a task needs more than the basic `SKILL.md` workflow.

## Primary Files

- `agentforge_autonomous/src/core/interfaces/Agent.ts`: source of truth for `AgentInput`, `AgentOutput`, and `Agent`.
- `agentforge_autonomous/src/agents/registry.ts`: discoverable agent registry.
- `agentforge_autonomous/src/agents/schemas.ts`: shared structured output schemas.
- `agentforge_autonomous/src/agents/progress-helper.ts`: progress/log helper behavior.
- `agentforge_autonomous/src/agents/{role}/{Role}Agent.ts`: role implementations.
- `agentforge_autonomous/src/agents/pipeline/PipelineAgent.ts`: pipeline orchestration agent.
- `agentforge_autonomous/src/lib/pipeline-runner.ts`: pipeline runner integration.
- `agentforge_autonomous/src/app/api/agent/run/route.ts`: API entry point for agent runs.
- `agentforge_autonomous/src/app/api/pipeline/route.ts`: API entry point for pipeline runs.

## Existing Roles

- planner
- builder
- reviewer
- tester
- learning
- context
- gmail classification, priority, and response agents
- pipeline

## Implementation Checklist

- Keep constructor dependencies explicit and testable.
- Validate required context values before using them.
- Return failed `AgentOutput` instead of throwing for expected task-level failures.
- Let unexpected programming errors surface to tests unless existing local code catches them.
- Include enough `logs` for the narrative panel to explain what happened.
- Keep `data` structured and serializable.
- Update registry exports when a new agent is added.
- Add tests for success and meaningful failure paths.

## Common Test Targets

- `agentforge_autonomous/src/agents/__tests__/agents.test.ts`
- `agentforge_autonomous/src/lib/__tests__/structured-output.test.ts`
- `agentforge_autonomous/src/lib/__tests__/response-parser.test.ts`
- `agentforge_autonomous/src/lib/__tests__/progress.test.ts`
- `agentforge_autonomous/src/backend/services/__tests__/ObservableOrchestrator.test.ts`

## Compact Handoff Template

```text
TASK:
COMPLETED:
FILES:
TESTS:
DECISIONS:
BLOCKERS:
NEXT:
```
