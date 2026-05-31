---
task_id: TASK-006
status: in-progress
assigned_to: claude-sonnet-4-6
depends_on: [TASK-001]
impeccable_test_pass: false
test_command: "npm test -- revenue 2>&1 | grep -E 'PASS|FAIL'"
---

# Revenue Tracking Widget on Dashboard

## Acceptance Criteria

- [x] src/lib/revenue-parser.ts parses revenue_tracker.csv to typed records
- [x] src/lib/__tests__/revenue-api.test.ts passes (unit tests for CSV parser)
- [x] src/app/api/badgerheart/revenue/route.ts returns JSON from CSV
- [ ] src/components/revenue-tracker-widget.tsx shows monthly revenue vs $1000 target
- [ ] Widget renders progress bar (revenue / 1000 * 100%)
- [ ] badgerheart:revenue:updated event emitted via agentEventBus when data loads
- [ ] Widget shows "Offline" state gracefully when CSV is missing
- [ ] No hardcoded values -- target ($1000) comes from env config or projects.json

## Review Notes

revenue-parser.ts and tests completed by claude-sonnet-4-6 on 2026-05-31. All 6 Vitest tests pass.
API route uses existing AgentLogEvent (no type casts). Widget pending in Task 5.
