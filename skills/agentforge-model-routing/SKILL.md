---
name: agentforge-model-routing
description: Maintain AgentForge model routing, provider selection, fallback behavior, health tracking, cost rules, and task classification. Use when editing agentforge_autonomous/src/routing, LLMProviderChain, execution backends, model/provider config, provider tests, or any code that chooses between Ollama, Groq, Cerebras, Together, Mistral, Claude, and OpenAI.
---

# AgentForge Model Routing

Use this skill when changing how AgentForge chooses or falls back between models.

## Token Discipline

Inspect `ModelRouter.ts`, `types.ts`, and the failing or requested test first. Load `references/model-routing-map.md` only when you need provider rules, test targets, or a handoff template.

Avoid refreshing external model facts unless the task explicitly asks for current provider/model availability. Local project policy is the source of truth for ordering and budget behavior.

## Workflow

1. Read `agentforge_autonomous/src/routing/ModelRouter.ts`.
2. Read `agentforge_autonomous/src/routing/types.ts`.
3. Trace call sites only as needed: provider chain, execution backend, route handler, tests.
4. Preserve the free/local-first provider order unless the user explicitly changes policy.
5. Keep routing deterministic for the same task profile and health state.
6. Update tests for provider ranking, fallback, health, and task classification.

## Routing Rules

- Prefer Ollama and free providers before paid providers.
- Respect the daily budget rule from root `CLAUDE.md`.
- Mark failed providers unhealthy only through the existing health/failure path.
- Keep fallback decisions explainable with a clear `reason`.
- Do not hardcode secrets or read raw env vars outside the env config layer.
- Keep task classification small and auditable.

## Verification

Use focused tests before full verification:

```bash
npm test -- src/backend/services/__tests__/failure-recovery.test.ts
npm test -- src/lib/__tests__/real-llm-pipeline.test.ts
npm test
npm run build
```

If live provider tests require credentials or Ollama, state what was skipped.
