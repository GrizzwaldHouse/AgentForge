---
task_id: TASK-0005
title: "Set up Gumroad store and connect Mercury ACH"
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
priority: P1
deadline: 2026-06-01
---

# HANDOFF Contract

## Context

Gumroad store must be live before first product can be published. Mercury
account is confirmed open. This is a human-action task -- no agent can
complete it.

URL: https://gumroad.com
Settings path: Settings > Payments > Add bank account > ACH

Form fill:
- Display Name: Badger Heart LLC
- Support Email: badgerheartstudio@gmail.com
- Bank Account Type: Business Checking
- Routing Number: 121145433 (Mercury / COLUMN N.A.)
- Account Number: from Mercury dashboard

## Acceptance Criteria

- [ ] Gumroad account created at badgerheartstudio@gmail.com
- [ ] Display name set to Badger Heart LLC or GrizzwaldHouse
- [ ] Mercury ACH connected (routing 121145433)
- [ ] Payout method confirmed active in Gumroad dashboard
- [ ] Profile bio updated (buyer-outcome focused, no em dashes)

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

Mercury routing number 121145433 is COLUMN N.A. bank. Account number is in
Mercury dashboard under account details. Do not use personal bank details.

## Review Notes

_Populated by reviewer on completion._
