---
task_id: TASK-0022
title: "Reference migration wave: classify staged references; lock canonical destinations"
status: pending
assigned_to: "Owl"
project: badgerheart
branch: ""
pr_url: ""
depends_on: []
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "Get-Content docs\\store-ops\\REFERENCE_MIGRATION_MATRIX.md"
created: 2026-06-01
updated: 2026-06-01
domain: cross-store-admin
lane: cross-store-admin
priority: P3
deadline: null
---

# HANDOFF Contract

## Context

Migrated from Hub tasks/cross-store-admin/pending/ reference migration file.
Original task content preserved in that file. Admin lane for reference governance.
May read both store branches but must not rewrite sellable records inside
target store repos.

Source refs: docs/store-ops/REFERENCE_MIGRATION_MATRIX.md,
_extracted_gumroad_ready, _extracted_gumroad_chatgpt, _extracted_jasmen,
marketplace_pipeline, docs/AgentForge_Marketplace_Handoff_2026-05-28.md

## Acceptance Criteria

- [ ] Migration decision made for every staged reference family in first wave
- [ ] Hook spec and state contract maintained
- [ ] Keep/merge/archive decision for historical Gumroad inputs documented
- [ ] REFERENCE_MIGRATION_MATRIX.md updated

## Dependencies

None.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Review Notes

_Populated by reviewer on completion._
