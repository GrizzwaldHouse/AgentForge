---
task_id: TASK-0002
title: "Send written-denial demand to Antwon.German@va.gov (38 CFR 21.257)"
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
deadline: 2026-07-31
---

# HANDOFF Contract

## Context

VR&E has five documented failures on file. A written-denial demand under
38 CFR 21.257 must be sent to Antwon.German@va.gov with fax to (619) 400-1588.
Required to preserve appeal rights before the July 2026 childcare eligibility
deadline. Send all four complaint letters on the same day:
Rep. Issa, VA OIG, CalVet, VR&E Supervisor.

EAA back-pay outstanding: approx $2,400-2,800 at online subsistence rate
(38 CFR 21.268). Never cite $6,878 -- that was the in-person BAH rate.

## Acceptance Criteria

- [ ] Demand letter drafted citing 38 CFR 21.257 and all five documented failures
- [ ] Letter sent to Antwon.German@va.gov
- [ ] Fax copy sent to (619) 400-1588
- [ ] Rep. Issa letter sent (call office first: (760) 304-7575)
- [ ] VA OIG complaint submitted at vaoig.gov/hotline/online-forms
- [ ] CalVet complaint sent to Calvetboard@calvet.ca.gov
- [ ] Confirmation or sent receipts saved to BadgerHeartOps/legal/

## Dependencies

None. This task has no blockers.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Cite these five failures in the demand letter:
1. Ergonomic equipment denied after 2+ years (38 CFR 21.210/21.262)
2. $2,700 computer reimbursement denied (38 CFR 21.282(c))
3. ~2 months subsistence allowance unpaid (38 CFR 21.268)
4. Employment development delayed ~2 months with no notice
5. July 2026 childcare deadline at risk

Request written denial of each item. Written denial triggers formal appeal rights.

## Review Notes

_Populated by reviewer on completion._
