# Claude Code Implementation Prompt: A5 Phase 2.1 Foundation

Copy this entire prompt into Claude Code at the AgentForge project root.

---

You are working inside the AgentForge project at the root path the user gives you. Before writing any code, do the following in order. Stop and ask for clarification at any step where the answer is not obvious.

## Step 1, Read the PRD addendum

Read `docs/PRD_A5_PLAYWRIGHT.md`. Treat it as the source of truth for this work.

## Step 2, Scan the repo

List every file under `apps/job-agent/`. Confirm the following already exist:

- `apps/job-agent/config/settings.json`
- `apps/job-agent/agents/` (directory)
- `apps/job-agent/contracts/` (directory)
- `memory/core_memory.json`

If any are missing, stop and report.

## Step 3, Confirm A5 does not already exist

Grep the repo for `AutoApplyAgent`, `a5_auto_apply`, `auto_apply`. If any production code matches (config keys are fine), stop and ask whether to extend or replace.

## Step 4, Phase 2.1 scope

Build only Phase 2.1 from the PRD addendum. Do not start Phase 2.2. Phase 2.1 is:

1. Add the `auto_apply` block from `docs/settings_auto_apply_block.json` to `apps/job-agent/config/settings.json`. Preserve every existing key.
2. Add Pydantic event schemas for `ApplicationReadyEvent`, `ApplicationSubmittedEvent`, `ApplicationFailedEvent`, `ApplicationSkippedEvent`, `DailyCapReachedEvent`, `CaptchaDetectedEvent`, `KillSwitchTrippedEvent` under `apps/job-agent/contracts/events.py`. Match the JSON shapes in the PRD exactly.
3. Create `apps/job-agent/agents/a5_auto_apply.py` with the `AutoApplyAgent` class. The agent must:
   - Take its dependencies (event bus, config loader, logger, sqlite session, audit log writer) via constructor injection.
   - Subscribe to the event named in `auto_apply.trigger_event`.
   - On receipt, log the event at INFO with structured fields, then return without doing anything else. The browser layer is Phase 2.2.
4. Create the SQLite migration file `apps/job-agent/migrations/001_applications.sql` with the `applications` table. Columns: `application_id TEXT PRIMARY KEY`, `job_url TEXT NOT NULL`, `ats TEXT`, `match_score REAL`, `outcome TEXT NOT NULL`, `started_at TEXT NOT NULL`, `completed_at TEXT`, `duration_ms INTEGER`, `evidence_json TEXT`, `agent_version TEXT NOT NULL`. Index on `outcome` and `started_at`.
5. Wire `AutoApplyAgent` into the agent registry so the orchestrator instantiates it on startup.
6. Add a BDD-style test `tests/agents/test_a5_auto_apply.py` that uses the AAA pattern. Arrange a fake event bus and a sample `ApplicationReadyEvent`, Act by publishing, Assert that the agent logged the receipt and did not crash.

## Step 5, Constraints (non-negotiable)

- No hardcoded values. Every threshold, path, timeout comes from `settings.json`.
- No global mutable state.
- Dependency injection for every collaborator.
- Typed errors. Define `AutoApplyError` as the base class even if Phase 2.1 does not raise it yet.
- Structured logging only. Levels ERROR, WARN, INFO, DEBUG. Log transitions only.
- Comments explain WHY, not WHAT.
- No em-dashes anywhere in code, comments, docstrings, commit messages, or markdown.
- No placeholders. No "TODO" markers without an issue number.

## Step 6, Verify before declaring done

Run, in order:

1. `grep -rn "—" apps/job-agent/` (must return nothing)
2. `python -m pytest tests/agents/test_a5_auto_apply.py -v`
3. `python -c "from apps.job_agent.contracts.events import ApplicationReadyEvent; print('ok')"`
4. `python -m apps.job_agent.run --once` and confirm the log shows `AutoApplyAgent subscribed to ApplicationReadyEvent`.

If any of these fail, do not declare done. Fix and re-run.

## Step 7, Output

When everything passes, produce a single message containing:

1. The list of files created or modified.
2. The exact commands the user should run to test.
3. The next-phase checklist (Phase 2.2 from the PRD addendum), as a bullet list, no code.

Stop there. Do not start Phase 2.2.
