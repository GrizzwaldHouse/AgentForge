---
name: agentforge-phase1-resume
description: Resume AgentForge + BadgerHeart OS Phase 1 subagent execution from where the session limit interrupted it
trigger: "agentforge phase 1", "resume phase 1", "continue phase 1", "finish agentforge tasks"
---

# AgentForge Phase 1 Resume

This skill picks up Phase 1 execution after a session limit or interruption.
It reads the current SESSION_HANDOFF.md, determines what is unfinished, and
dispatches the correct subagents via `superpowers:subagent-driven-development`.

## Step 1: Orient

Read these files in order:
1. `C:\Users\daley\Projects\AgentForge\SESSION_HANDOFF.md` -- current state
2. `C:\Users\daley\Projects\AgentForge\docs\superpowers\plans\2026-05-31-agentforge-badgerheart-os-phase1.md` -- full task specs

Run git status to confirm what is staged vs untracked:
```powershell
cd "C:\Users\daley\Projects\AgentForge"; git log --oneline -6; git status --short
```

## Step 2: Determine Resume Point

Check which tasks are incomplete by reading the HANDOFF.md stubs in `tasks/`:
- `status: pending` or `status: in-progress` = needs work
- `status: done` = skip

## Step 3: Execute Remaining Tasks

Use `superpowers:subagent-driven-development` to dispatch one subagent per task.
Always provide the full task spec from the plan file -- never make subagents read the plan themselves.

### Currently Pending (as of 2026-06-01 session end)

- **Task 5** (TASK-006 widget): `src/components/revenue-tracker-widget.tsx` exists untracked. 
  Read it, verify content, add import to dashboard/page.tsx, build check, commit.
  
- **Task 6** (TASK-004 chatbot): Create model-selector.tsx, chat-panel.tsx, dashboard/chat/page.tsx.
  Uses existing /api/agent/run route. No polling.

- **Task 7** (TASK-005 BadgerHeart): Create external task directories + HANDOFF.md examples.
  External to this repo: C:\Users\daley\Projects\BadgerHeart\

- **Task 8** (SESSION_HANDOFF.md): Update SESSION_HANDOFF.md to final state, commit.

## Non-Negotiables (always enforce)

- No Co-Authored-By trailers on any commits
- No em dashes anywhere -- double hyphens only
- ES Modules only, npm only
- Zero setInterval / polling -- observer pattern via agentEventBus
- AgentEvent union is closed -- extend types.ts properly, never `as never`

## Plan File Location

`C:\Users\daley\Projects\AgentForge\docs\superpowers\plans\2026-05-31-agentforge-badgerheart-os-phase1.md`

Task 5 = lines 1053-1178 (Revenue Tracker Widget)
Task 6 = lines 1185-1438 (Chat Panel UI)
Task 7 = lines 1441-1562 (BadgerHeart Task Directories)
Task 8 = lines 1565-1644 (Session Handoff)
