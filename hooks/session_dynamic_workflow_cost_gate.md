# Hook: Session Dynamic Workflow Cost Gate

**Hook type:** Pre-action gate
**Trigger:** Any request to launch `/deep-research`, `ultracode`, or a dynamic workflow

---

## Purpose

Block dynamic workflow launches that would waste tokens on tasks better served by a skill, subagent, or `/goal`. This gate runs as a check before any fan-out is authorized.

---

## Gate Questions

Before approving a dynamic workflow, Claude must answer all five questions. A `NO` on any question blocks the workflow.

| # | Question | If NO |
|---|---|---|
| 1 | Can the work split into 5+ independent units? | Route to subagent or `/goal` |
| 2 | Is the target list finite and known before launch? | Gather scope first, then re-evaluate |
| 3 | Does a cheaper pattern (skill, subagent, `/goal`) NOT solve it? | Use the cheaper pattern |
| 4 | Is a clear synthesis output defined? | Define it before proceeding |
| 5 | Has remaining daily token budget been checked and is it sufficient? | Defer or use a cheaper pattern |

---

## Behavior

**Pass (all YES):** Emit `WORKFLOW_APPROVED` event. Proceed with `WORKFLOW_STARTED` only after registering kill-switch and synthesis handlers on the EventBus.

**Fail (any NO):** Do not emit `WORKFLOW_STARTED`. Return the recommended alternative pattern to the caller.

---

## Config

This gate reads from `/config/workflow.config.json`:

```json
{
  "costGateEnabled": true,
  "minUnitsForWorkflow": 5,
  "minBudgetUsd": 0.10
}
```

Set `costGateEnabled: false` only in a local dev environment to bypass the gate during testing.

---

## EventBus Integration

```typescript
// Register the gate as a pre-condition check handler
owlWatcher.on(EventType.WORKFLOW_REQUESTED, costGateHandler.handle.bind(costGateHandler));

// costGateHandler emits one of:
// - WORKFLOW_APPROVED  (all criteria met)
// - WORKFLOW_BLOCKED   (criteria not met, includes recommended alternative)
```

---

## Non-Negotiables

- This gate **must** run before every dynamic workflow launch, including `/deep-research` and `ultracode`.
- Never bypass by setting `costGateEnabled: false` in production.
- Kill-switch handler **must** be registered on EventBus before any `WORKFLOW_STARTED` emission (see `skills/dynamic-workflow-router/SKILL.md`).

---

*See also: `skills/dynamic-workflow-router/SKILL.md` for routing logic.*
*See also: `workflows/dynamic_workflow_audit_pattern.md` for a pattern that passes this gate.*
