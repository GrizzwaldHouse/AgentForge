# Model Routing Map

Use this reference when the task needs more context than the base skill.

## Primary Files

- `agentforge_autonomous/src/routing/ModelRouter.ts`: provider ranking, health, fallback, task classification.
- `agentforge_autonomous/src/routing/types.ts`: provider names, task domains, complexity, routing config.
- `agentforge_autonomous/src/backend/services/LLMProviderChain.ts`: provider execution chain.
- `agentforge_autonomous/src/backend/execution/ProviderChainBackend.ts`: backend integration.
- `agentforge_autonomous/src/backend/execution/OllamaBackend.ts`: local Ollama execution.
- `agentforge_autonomous/src/backend/execution/SimulatedBackend.ts`: deterministic test backend.
- `agentforge_autonomous/src/config/env.ts`: environment parsing and API key availability.
- `agentforge_autonomous/config/default.json`: default runtime config.

## Provider Policy

The project preference from `CLAUDE.md` is:

1. Ollama
2. Groq
3. Cerebras
4. Together
5. Mistral
6. Claude
7. OpenAI

Use free-tier and local options first. Paid providers must remain budget-aware.

## Change Checklist

- Add any new provider to provider specs, provider types, health initialization, and tests.
- Keep fallback lists ordered and free/local-first.
- Include `reason` strings that explain choices without leaking secrets.
- Update task domain mappings when adding an agent role.
- Keep model names centralized in provider specs or config.
- Test no-key, unhealthy, failure, and recovery states.

## Common Test Targets

- `agentforge_autonomous/src/backend/execution/__tests__/ExecutionBackend.test.ts`
- `agentforge_autonomous/src/backend/execution/__tests__/SimulatedBackend.test.ts`
- `agentforge_autonomous/src/backend/services/__tests__/failure-recovery.test.ts`
- `agentforge_autonomous/src/backend/services/__tests__/integration.test.ts`
- `agentforge_autonomous/src/lib/__tests__/real-llm-pipeline.test.ts`

## Compact Handoff Template

```text
TASK:
COMPLETED:
FILES:
PROVIDER POLICY:
TESTS:
SKIPPED:
BLOCKERS:
NEXT:
```
