---
name: agentforge-agent-contracts
description: Preserve AgentForge agent interfaces, outputs, registry wiring, pipeline behavior, and tests. Use when adding, editing, reviewing, or debugging files under agentforge_autonomous/src/agents, src/core/interfaces/Agent.ts, agent registry code, pipeline agents, orchestrator agent lists, or agent test coverage.
---

# AgentForge Agent Contracts

Use this skill to keep AgentForge agents compatible with the local orchestration contract.

## Token Discipline

Start narrow. Read only the files touched by the task plus the contract file. Load `references/agent-contract-map.md` only when you need the file map, verification matrix, or handoff template.

Prefer targeted searches and tests over broad tree reads. When the task grows beyond one agent, leave a compact handoff with: task, files touched, tests run, decisions, blockers.

## Workflow

1. Read `agentforge_autonomous/src/core/interfaces/Agent.ts`.
2. Inspect the specific agent folder and `agentforge_autonomous/src/agents/registry.ts` before changing behavior.
3. Preserve `Agent.execute(input): Promise<AgentOutput>`.
4. Return `{ success, data?, logs }` from every agent path.
5. Keep agent ids stable unless the task explicitly requires a migration.
6. Add or adjust focused Vitest coverage near the behavior you changed.

## Contract Rules

- Use ES modules and `@/*` imports for app code.
- Keep `logs` human-readable and useful for dashboard/narrative output.
- Do not put UI concerns inside agent implementations.
- Do not bypass safety gates or orchestrator execution flow.
- Keep registry changes explicit so orchestrator and API callers can discover the agent.

## Verification

Run the narrowest relevant test first, then broaden only when shared behavior changed:

```bash
npm test -- src/agents/__tests__/agents.test.ts
npm test
npm run build
```

If tests cannot run, report the exact command and failure.
