---
task_id: TASK-0001
title: "Sign Operating Agreement"
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
domain: VRE
lane: cross-store-admin
priority: P1
deadline: 2026-06-02
---

# HANDOFF Contract

## Context

Operating Agreement must be signed before DVBE and SDVOSB certifications can be
submitted. JAG review is free as a military spouse benefit. Original target was
2026-05-26 post-Japan. Now due 2026-06-02.

DVBE: caleprocure.ca.gov (30-60 day processing, free)
SDVOSB: veterans.certify.sba.gov (~12 day processing post-Nov 2025)

## Acceptance Criteria

- [ ] Operating Agreement document drafted (use JAG template or Military OneSource)
- [ ] Operating Agreement signed by Marcus Daley as sole member
- [ ] Signed copy saved to BadgerHeartOps/legal/
- [ ] DVBE application unblocked (confirm Operating Agreement is the only blocker)

## Dependencies

None. This task has no blockers.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A -- document task)
- [ ] Observer pattern audit: no polling (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Single-member LLC Operating Agreement should cover: member name and address,
ownership percentage (100%), capital contributions, profit/loss allocation,
management structure (member-managed), dissolution terms. Military OneSource
800-342-9647 provides free legal help. JAG at partner's installation also free.

## Review Notes

_Populated by reviewer on completion._
