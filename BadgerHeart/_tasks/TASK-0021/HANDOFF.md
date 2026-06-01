---
task_id: TASK-0021
title: "Standup agent rollout: adopt v2.1.0 config; track null scaffold work"
status: pending
assigned_to: "Owl"
project: badgerheart
branch: ""
pr_url: ""
depends_on: ["TASK-0016", "TASK-0017", "TASK-0018"]
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "Get-Content docs\\store-ops\\standup-agent-master.v2.1.0.json -TotalCount 40"
created: 2026-06-01
updated: 2026-06-01
domain: cross-store-admin
lane: cross-store-admin
priority: P3
deadline: null
---

# HANDOFF Contract

## Context

Migrated from Hub tasks/cross-store-admin/pending/2026-05-31-standup-agent-rollout.md.
Original task content preserved in that file. This HANDOFF wrapper adds frontmatter
for backlog tracking. Do not delete the original Hub pending file.

Source refs: docs/store-ops/standup-agent-master.v2.1.0.json,
docs/store-ops/STANDUP_AGENT_BOARD_SYNC_PROTOCOL.md

## Acceptance Criteria

- [ ] Standup agent v2.1.0 JSON confirmed as durable source of truth in Hub
- [ ] Rollout protocol written explaining connector expectations and self-log usage
- [ ] Follow-up tracked for null Todoist section scaffolds (TASK-0016, 0017, 0018)
- [ ] ONBOARDING.md updated with standup agent reference

## Dependencies

TASK-0016, TASK-0017, TASK-0018 scaffold work should complete first.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Review Notes

_Populated by reviewer on completion._
