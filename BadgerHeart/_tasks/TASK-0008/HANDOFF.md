---
task_id: TASK-0008
title: "Generate first Meshy prompt batch (5 asset types)"
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
domain: MESHY
lane: meshy
priority: P2
deadline: 2026-06-01
---

# HANDOFF Contract

## Context

Linear issue BAD-17. Current Meshy credit balance: 1,740 (1,305 usable after
25% reserve). 8 sci-fi industrial assets already cleaned. This batch extends
into new asset types to reach the 15-asset bundle target.

Cost: Meshy 6 = 20 credits per generation. Budget 100 credits for this batch
(5 assets at 20 credits each).

Candidate next categories: Fantasy Dungeon, Post-Apocalyptic, Tavern/Fantasy
Interior, additional Sci-Fi Industrial variants.

## Acceptance Criteria

- [ ] 5 new asset types selected and documented
- [ ] Prompts written for each asset type
- [ ] 5 assets generated in Meshy (4 draft variants each)
- [ ] Best variant per asset selected and exported as GLB
- [ ] Credit ledger updated: subtract 100 from 1,305 usable
- [ ] Linear issue BAD-17 updated with asset list

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

Use Meshy 6 for new generations (20 credits, higher quality). Meshy 5 for
draft exploration only (10 credits/4 drafts). AI disclosure required on Fab
and itch.io for all generated geometry.

## Review Notes

_Populated by reviewer on completion._
