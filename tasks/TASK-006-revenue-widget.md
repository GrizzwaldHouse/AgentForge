---
task_id: TASK-006
status: pending
assigned_to: ""
depends_on: [TASK-001]
impeccable_test_pass: false
test_command: "npm test -- revenue 2>&1 | grep -E 'PASS|FAIL'"
---

# Revenue Tracking Widget on Dashboard

## Acceptance Criteria

- [ ] src/lib/revenue-parser.ts parses revenue_tracker.csv to typed records
- [ ] src/lib/__tests__/revenue-api.test.ts passes (unit tests for CSV parser)
- [ ] src/app/api/badgerheart/revenue/route.ts returns JSON from CSV
- [ ] src/components/revenue-tracker-widget.tsx shows monthly revenue vs $1000 target
- [ ] Widget renders progress bar (revenue / 1000 * 100%)
- [ ] badgerheart:revenue:updated event emitted via agentEventBus when data loads
- [ ] Widget shows "Offline" state gracefully when CSV is missing
- [ ] No hardcoded values — target ($1000) comes from env config or projects.json

## Review Notes
