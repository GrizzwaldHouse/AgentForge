---
task_id: TASK-0013
title: "Q2 federal estimated tax payment (SE 15.3%)"
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
domain: LLC
lane: cross-store-admin
priority: P2
deadline: 2026-06-15
---

# HANDOFF Contract

## Context

SE tax is 15.3% on net self-employment income. Q2 payment due June 15, 2026.
Pay via EFTPS at eftps.gov under SSN (not EIN) for Form 1040-ES.
VA disability compensation (100% P&T) is completely tax-free -- do not include.

## Acceptance Criteria

- [ ] Q1-Q2 net self-employment income calculated
- [ ] SE tax amount calculated (income x 0.153)
- [ ] Payment submitted via eftps.gov under SSN
- [ ] Payment confirmation saved to BadgerHeartOps/revenue/

## Dependencies

None. Payment is zero if no income yet -- still document the calculation.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Deductible tool expenses: Claude Max ($100/mo), ChatGPT Plus ($20/mo),
Cursor Pro ($20/mo), Meshy AI ($20/mo). Document business use for each.
If income to date is $0, estimated payment is $0 but document the calculation.

## Review Notes

_Populated by reviewer on completion._
