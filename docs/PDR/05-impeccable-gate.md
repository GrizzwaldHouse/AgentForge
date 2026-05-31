# PDR 05 -- Impeccable Quality Gate

## Purpose

Defines the six checks that must all pass before any task moves from review to done. Enforced by the reviewer agent and (Phase 3) by `npm run impeccable`.

## Six Required Checks

| # | Check | Command | Passes when |
|---|-------|---------|-------------|
| 1 | Unit/integration tests | `npm test` | Zero test failures |
| 2 | ESLint | `npm run lint` | Zero errors (warnings allowed) |
| 3 | Observer pattern audit | grep for `setInterval` or `while.*true` in `src/` | Zero matches |
| 4 | No hardcoded values | grep for Windows path literals in `src/` | Zero path literals in src/ |
| 5 | Acceptance criteria | Manual -- all checkboxes in HANDOFF.md checked | All checked |
| 6 | Reviewer sign-off | `review_notes` contains `APPROVED` | Present |

## Phase 3: npm run impeccable (automated)

In Phase 3, `package.json` gains:

```json
{
  "scripts": {
    "impeccable": "npm run lint && npm test && node scripts/impeccable-audit.js"
  }
}
```

`scripts/impeccable-audit.js` runs checks 3 and 4 programmatically and exits non-zero on failure. Phase 3 task: `tasks/TASK-009-impeccable-gate.md`.

For Phase 1, the gate is enforced manually by the reviewing agent using the table above.
