---
task_id: TASK-0006
title: "Submit Elemental Progression Combat Kit to Fab"
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
lane: gumroad
priority: P1
deadline: 2026-07-14
---

# HANDOFF Contract

## Context

Hyperwallet payout rail confirmed active as of 2026-06-01. No blockers remain.
Zero direct Fab competition confirmed at $59.99. Fab review time for code
plugins is 2-3 weeks so submit immediately to hit July 14 target.

Product: gh_elemental_combat_001
Price: $59.99 STANDALONE ONLY -- NEVER bundle this product under any circumstances
AI disclosure: NOT REQUIRED (code plugin)
Gallery spec: 1920x1080 minimum, under 3MB, JPEG or PNG
Gallery rule: images must be recreated from scratch -- no real UE5 editor screenshots (EULA)

## Acceptance Criteria

- [ ] Gallery image briefs written for all required slots (see TASK-0014)
- [ ] Gallery images created per briefs at 1920x1080, under 3MB
- [ ] Fab listing title written (30 character hard limit)
- [ ] Fab short description written with feature bullets and integration steps
- [ ] Product submitted via Fab publisher dashboard
- [ ] Submission confirmation saved to GumroadStore/GumroadReference/HANDOFFS/

## Dependencies

TASK-0014 (listing copy + gallery briefs) should complete first, but submission
can begin without gallery briefs if deadline pressure requires.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

$59.99 anchor protects the premium positioning. Do not discount. Do not add
to any bundle. This is the only Fab product with zero direct competition --
that justification disappears the moment it is bundled.

## Review Notes

_Populated by reviewer on completion._
