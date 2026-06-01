---
task_id: TASK-0016
title: "Scaffold Todoist sections NOW/NEXT/LATER under Blender Workshop project"
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
domain: BLENDER
lane: cross-store-admin
priority: P3
deadline: null
---

# HANDOFF Contract

## Context

Standup agent v2.1.0 shows blender sections as null under Todoist project
6gm9QWjFF2wmVqvP (Blender Workshop). Scaffold required before any BLENDER
domain sessions can run the standup protocol.

Per standup agent rules: do not create sections autonomously. Present scaffold
request to Marcus and wait for confirmation before creating.

## Acceptance Criteria

- [ ] Marcus confirms scaffold approval
- [ ] Section "NOW" created under Todoist project 6gm9QWjFF2wmVqvP
- [ ] Section "NEXT" created under Todoist project 6gm9QWjFF2wmVqvP
- [ ] Section "LATER" created under Todoist project 6gm9QWjFF2wmVqvP
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
Never fabricate section IDs. If API call fails, report gap and stop.

## Review Notes

_Populated by reviewer on completion._
