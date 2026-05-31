---
task_id: TASK-007
status: done
assigned_to: claude-sonnet-4-6
depends_on: [TASK-001]
impeccable_test_pass: true
test_command: "test -f .cursor/rules/coding-standards.md && echo OK"
---

# Cursor Rules -- Coding Standards

## Acceptance Criteria

- [x] .cursor/rules/ directory created
- [x] .cursor/rules/coding-standards.md written with all 7 non-negotiables
- [x] Each rule has a bad example and a good example (same format as CLAUDE.md)
- [x] CLAUDE.md updated with ## Skills section and ## PDR Documents reference

## Review Notes

Implemented by claude-sonnet-4-6 on 2026-05-31.
- Created `.cursor/rules/coding-standards.md` with all 7 rules, each with BAD/GOOD TypeScript examples.
- Rules cover: Observer pattern (no polling), no hardcoded values, defaults in constructors, ES Modules only, npm only, WHY comments, and file headers.
- Project Discovery, Task Protocol, and PDR Documents sections appended to the coding standards.
- CLAUDE.md updated with ## Skills and ## PDR Documents sections at the end.
- All double hyphens used throughout; no em dashes.
