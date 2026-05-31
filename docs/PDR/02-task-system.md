# PDR 02 -- Task System (HANDOFF.md Protocol)

## Purpose

Defines how agents claim, execute, submit, and complete tasks across all projects.

## Key Files

| File | Path | Responsibility |
|------|------|---------------|
| Task stubs | `tasks/TASK-*.md` | AgentForge task queue |
| BadgerHeart tasks | `C:\Users\daley\Projects\BadgerHeart\<module>\tasks\` | Pipeline task queues |

## HANDOFF.md Schema (required fields)

```yaml
---
task_id: TASK-001          # unique ID, format TASK-NNN or TASK-BH-NNN
status: pending            # pending | in-progress | review | done
assigned_to: ""            # agent slug, e.g. claude-sonnet-4-6 or cursor
depends_on: []             # list of task_ids that must be done first
impeccable_test_pass: false # set to true before moving to review
test_command: "npm test"   # exact command that proves the task is done
---
```

## Status Lifecycle

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> in-progress : agent creates task branch and updates assigned_to
  in-progress --> review : impeccable_test_pass set to true, PR opened
  review --> done : reviewer signs off in review_notes, PR merged
  review --> in-progress : changes requested
```

## Git Branch Naming

```
task/<task-id>-<agent-slug>

Examples:
  task/TASK-004-claude-code
  task/TASK-BH-001-cursor
  task/TASK-006-ollama-codellama
```

## PR Submission Checklist

Before opening a PR the implementing agent must:
1. Set `impeccable_test_pass: true` in HANDOFF.md
2. Run `npm run impeccable` (or equivalent checks) and paste output in review_notes
3. Check off all acceptance criteria checkboxes in HANDOFF.md
4. Open PR targeting `main`, PR title: `[TASK-XXX] Brief description`
5. Use HANDOFF.md content (task_id, status, criteria, review_notes) as the PR body

## Model Routing Table

| Task type | Primary model | Fallback |
|-----------|--------------|---------|
| Code generation | ollama (codellama or llama3) | groq |
| Documentation | ollama (llama3) | groq |
| Review | claude-sonnet-4-6 | groq |
| Pipeline/asset tasks | ollama | groq |
