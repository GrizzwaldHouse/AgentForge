# Safety Policy Map

Use this reference when a safety task needs more context than the base skill.

## Primary Files

- `agentforge_autonomous/src/safety/types.ts`: action, policy, audit, and decision types.
- `agentforge_autonomous/src/safety/policy-engine.ts`: pure policy evaluation.
- `agentforge_autonomous/src/safety/safety-guard.ts`: guard orchestration.
- `agentforge_autonomous/src/safety/approval-service.ts`: approval flow.
- `agentforge_autonomous/src/safety/audit-logger.ts`: audit persistence.
- `agentforge_autonomous/src/safety/kill-switch.ts`: kill-switch state.
- `agentforge_autonomous/src/safety/index.ts`: public safety exports.
- `agentforge_autonomous/src/backend/services/ObservableOrchestrator.ts`: pre-agent safety gate.
- `agentforge_autonomous/src/app/api/safety/route.ts`: safety API surface.

## Policy Expectations

- `SEND_EMAIL` and `SEND_MESSAGE` check message length, recipient count, blocked domains, and allow-list behavior.
- `DELETE_FILE` and `EXECUTE_COMMAND` require approval.
- Unknown or low-risk actions may allow only when no policy rule matches.
- Kill switch must be able to stop automation globally.
- Audit records must be useful for later review without leaking secrets.

## Change Checklist

- Add or update type definitions before policy logic.
- Add direct policy tests for every new rule.
- Add integration tests when orchestrator or API behavior changes.
- Keep default policy conservative.
- Keep error messages actionable and safe to show in UI.
- Document skipped tests when credentials or local services are unavailable.

## Common Test Targets

- `agentforge_autonomous/src/lib/__tests__/safety.test.ts`
- `agentforge_autonomous/src/lib/__tests__/safety-integration.test.ts`
- `agentforge_autonomous/src/backend/services/__tests__/validation.test.ts`
- `agentforge_autonomous/src/backend/services/__tests__/ObservableOrchestrator.test.ts`

## Compact Handoff Template

```text
TASK:
COMPLETED:
FILES:
POLICY DECISIONS:
TESTS:
RISKS:
BLOCKERS:
NEXT:
```
