---
task_id: TASK-0017
title: "Scaffold Todoist sections NOW/NEXT/LATER under Upwork Pipeline project"
status: pending
assigned_to: ""
project: badgerheart
branch: ""
pr_url: ""
depends_on: []
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "echo no automated test - human verification required"
created: 2026-06-01
updated: 2026-06-01
domain: UPWORK
lane: cross-store-admin
priority: P3
deadline: null
---

# HANDOFF Contract

## Context

Standup agent v2.1.0 shows upwork sections as null under Todoist project
6gm9QWmpvXH9PHwp (Upwork Pipeline). Scaffold required.
Hard deadline: July 31, 2026 for revenue documentation (childcare eligibility).

## Acceptance Criteria

- [ ] Marcus confirms scaffold approval
- [ ] Section "NOW" created under Todoist project 6gm9QWmpvXH9PHwp
- [ ] Section "NEXT" created under Todoist project 6gm9QWmpvXH9PHwp
- [ ] Section "LATER" created under Todoist project 6gm9QWmpvXH9PHwp
- [ ] Returned section IDs recorded in standup-agent-master.v2.1.0.json
- [ ] Standup JSON updated at docs/store-ops/standup-agent-master.v2.1.0.json

## Dependencies

None.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

A write is not complete until a real Todoist section ID is returned by the API.

## Review Notes

_Populated by reviewer on completion._
