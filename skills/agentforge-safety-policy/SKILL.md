---
name: agentforge-safety-policy
description: Maintain AgentForge safety gates, approval policy, kill switch behavior, audit logging, guarded automation, and destructive-action controls. Use when editing agentforge_autonomous/src/safety, safety API routes, ObservableOrchestrator safety checks, external send/email behavior, audit logs, or tests for approvals and policy decisions.
---

# AgentForge Safety Policy

Use this skill when a change can allow, block, approve, log, or execute sensitive actions.

## Token Discipline

Read the touched safety file and its nearest test first. Load `references/safety-policy-map.md` only when you need the full safety surface, policy checklist, or handoff template.

Keep safety explanations short and decision-focused. Do not load unrelated app UI or agent code unless the safety path calls it.

## Workflow

1. Read the touched file under `agentforge_autonomous/src/safety`.
2. Read `agentforge_autonomous/src/safety/types.ts` and the nearest policy tests.
3. Trace orchestrator or API integration only when the change crosses that boundary.
4. Preserve approval requirements for external sends and destructive actions.
5. Keep audit events structured, serializable, and privacy-aware.
6. Add focused tests for allow, block, require-approval, and kill-switch paths.

## Safety Rules

- Default to `REQUIRE_APPROVAL` for ambiguous external or destructive actions.
- Never silently allow `DELETE_FILE` or `EXECUTE_COMMAND`.
- Preserve kill-switch behavior.
- Keep recipient/domain checks explicit and testable.
- Do not log secrets, email bodies beyond what tests require, or raw credentials.
- Keep policy pure where possible; side effects belong in services.

## Verification

Run focused safety tests first:

```bash
npm test -- src/lib/__tests__/safety.test.ts
npm test -- src/lib/__tests__/safety-integration.test.ts
npm test
npm run build
```

If a test depends on local env or credentials, report it as skipped with the reason.
