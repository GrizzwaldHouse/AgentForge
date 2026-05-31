# AgentForge + BadgerHeart OS — System Design Spec

**Date:** 2026-05-31  
**Status:** Locked (all 20 decisions confirmed 2026-05-31)  
**Owner:** Marcus Daley (@GrizzwaldHouse)  
**Entity:** Badger Heart LLC (CA LLC, EIN obtained)  
**Brainstorm artifact:** `docs/superpowers/specs/2026-05-31-agentforge-badgerheart-os-design.md`

---

## What This Document Is

This spec defines the AgentForge + BadgerHeart OS: a unified agent operating system that:

1. Makes AgentForge the single control-plane hub for all GrizzwaldHouse projects
2. Gives every agent (Claude Code, Cursor, Ollama models) a structured task system with checkout/checkin and an impeccable quality gate
3. Adds a chatbot interface in the existing AgentForge dashboard so all running Ollama models are accessible without copy-pasting paths
4. Integrates BadgerHeart LLC asset pipeline tasks (MeshyForge, BlenderWorkshop, FabStorefront) into the same unified task queue
5. Produces per-subsystem PDR documents that both Cursor and Claude Code can use as authoritative context

This is not a greenfield build. AgentForge already exists at `C:\Users\daley\Projects\AgentForge` with a working Next.js 15 app, event bus, agent cards, activity feed, and event stream. Every decision in this spec is additive to that foundation.

---

## Pre-Locked Context

| Label | Value |
|-------|-------|
| Hub repo | `C:\Users\daley\Projects\AgentForge` (Next.js 15) |
| Business entity | Badger Heart LLC (CA LLC, EIN obtained) |
| Asset pipeline | `C:\Users\daley\Projects\BadgerHeart` (MeshyForge, BlenderWorkshop, FabStorefront) |
| LLM chain | Ollama > Groq > Cerebras > Together > Mistral > Claude > OpenAI |
| Skills library | `C:\ClaudeSkills` (cowork-skills repo, master branch) |
| Deployment | Netlify (NOT Vercel), npm only (NOT yarn) |
| Revenue target | $1K/mo Q1 2026, $2-3K/mo Q2 2026 |

---

## Architecture Overview

```
AgentForge (C:\Users\daley\Projects\AgentForge)
  Heart of the OS — Next.js 15, event-driven, localhost:3000
  |
  |── projects.json          Central project registry (all GrizzwaldHouse repos)
  |── docs/PDR/              Per-subsystem PDR documents (Cursor + Claude Code)
  |── tasks/                 Centralized HANDOFF.md task store (mirrored in each repo)
  |
  |── src/app/dashboard/     Existing dashboard — extended with chatbot panel
  |── src/routing/ModelRouter.ts   Task-type routing to Ollama models
  |── src/core/events/       EventBus (SSE + in-memory) — no polling anywhere
  |
BadgerHeart (C:\Users\daley\Projects\BadgerHeart)
  LLC asset pipeline — HANDOFF.md tasks registered into AgentForge task system
  |
  |── MeshyForge/tasks/      3D asset generation task queue
  |── FabStorefront/tasks/   Marketplace listing task queue
  |── BlenderWorkshop/tasks/ Cleanup and export task queue

C:\ClaudeSkills                Skills library — referenced in each repo CLAUDE.md
```

All agent communication is event-driven via the existing `src/core/events/agent-event-bus.ts`. No polling. No `setInterval`. No direct agent-to-agent calls.

---

## Section 1: Folder Structure and Sandbox

### Decision 1.1 — Sandbox Root

**Locked:** AgentForge expands in place at `C:\Users\daley\Projects\AgentForge`.

AgentForge is the canonical hub. All other repos are referenced via `projects.json`. No new top-level sandbox directory is created. This preserves the existing CLAUDE.md, git history, and Next.js app structure.

### Decision 1.2 — Project Discovery

**Locked:** Central registry at `C:\Users\daley\Projects\AgentForge\projects.json`.

Every agent reads this file at session start to discover active projects. No hard-coded paths in prompts or skills. The file is the single source of truth for what projects exist and where they live.

**Schema:**

```json
{
  "version": "1.0",
  "updatedAt": "2026-05-31",
  "projects": [
    {
      "id": "agentforge",
      "name": "AgentForge",
      "path": "C:\\Users\\daley\\Projects\\AgentForge",
      "role": "hub",
      "claudeMd": "C:\\Users\\daley\\Projects\\AgentForge\\CLAUDE.md",
      "skills": ["agentforge-autopilot", "impeccable", "ollama-audit-training"],
      "active": true
    },
    {
      "id": "badgerheart",
      "name": "BadgerHeart",
      "path": "C:\\Users\\daley\\Projects\\BadgerHeart",
      "role": "asset-pipeline",
      "claudeMd": null,
      "skills": ["badgerheart-store-ops", "ue5-asset-pipeline"],
      "active": true
    },
    {
      "id": "bob-aicompanion",
      "name": "Bob-AICompanion",
      "path": "C:\\Users\\daley\\Projects\\Bob-AICompanion",
      "role": "automation",
      "claudeMd": "C:\\Users\\daley\\Projects\\Bob-AICompanion\\CLAUDE.md",
      "skills": [],
      "active": true
    },
    {
      "id": "portfolio",
      "name": "Portfolio Website",
      "path": "D:\\portfolio-website",
      "role": "marketing",
      "claudeMd": null,
      "skills": ["frontend-design"],
      "active": true
    },
    {
      "id": "basegame",
      "name": "WizardJam 2.0",
      "path": "C:\\Users\\daley\\UnrealProjects\\BaseGame",
      "role": "game",
      "claudeMd": "C:\\Users\\daley\\UnrealProjects\\BaseGame\\Documentation\\CLAUDE.md",
      "skills": ["game-dev-helper", "ue5-asset-pipeline"],
      "active": true
    },
    {
      "id": "islandescape",
      "name": "IslandEscape",
      "path": "D:\\FSO\\Capstone Project\\IslandEscape",
      "role": "game",
      "claudeMd": null,
      "skills": ["game-dev-helper"],
      "active": true
    }
  ]
}
```

### Decision 1.3 — Task Lifecycle

**Locked:** HANDOFF.md files at each task boundary. Status lives in YAML frontmatter. Files do not move between folders.

This avoids the fragility of moving files between `pending/`, `in-progress/`, and `done/` directories, which breaks git history and causes merge conflicts when multiple agents are working in parallel. Status changes are git-trackable edits to a single file.

Each repo maintains its own `tasks/` directory. AgentForge also maintains a root-level `tasks/` that aggregates cross-repo work.

**Directory structure per repo:**

```
tasks/
  TASK-001-sandbox-foundation.md
  TASK-002-handoff-schema.md
  TASK-003-projects-registry.md
  ...
```

### Decision 1.4 — HANDOFF.md Schema

**Locked:** All six fields are required.

```markdown
---
task_id: TASK-001
status: pending
assigned_to: ""
depends_on: []
impeccable_test_pass: false
test_command: "npm test"
---

# Task Title

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Review Notes

<!-- Populated by reviewer agent after submission -->
```

**Status lifecycle:** `pending` → `in-progress` → `review` → `done`

The `impeccable_test_pass` field is a boolean that must be set to `true` by the implementing agent before status can move to `review`. The `test_command` field specifies exactly what command proves it.

---

## Section 2: Agent Coordination Protocol

### Decision 2.1 — Task Checkout

**Locked:** Git branch per task using naming convention `task/<id>-<agent-slug>`.

Examples:
- `task/TASK-001-claude-code`
- `task/TASK-004-cursor`
- `task/TASK-007-ollama-codellama`

The branch is the lock. Two agents cannot be on the same branch simultaneously. Branch creation is the checkout action. PR merge is the check-in action. This gives a full audit trail with diff visibility and inline comment capability.

When an agent claims a task it also updates `assigned_to` in the HANDOFF.md frontmatter on its branch.

### Decision 2.2 — Review Submission

**Locked:** PR opened on the task branch with HANDOFF.md content as the PR description.

Before opening the PR, the implementing agent must:
1. Set `impeccable_test_pass: true` in HANDOFF.md
2. Paste test output in the Review Notes section of HANDOFF.md
3. Check off all acceptance criteria in HANDOFF.md
4. Open a PR targeting `main`

The PR title format: `[TASK-XXX] Brief description`

### Decision 2.3 — Impeccable Gate (Required to Move to Done)

**Locked:** All six checks must pass. No exceptions.

| Check | Tool | What Passes |
|-------|------|-------------|
| Unit/integration tests | `npm test` | Zero failures |
| ESLint | `npm run lint` | Zero errors |
| Observer pattern audit | grep for `setInterval\|setTimeout.*loop\|while.*true` | Zero matches in `src/` |
| No hardcoded values | grep for bare string literals in logic files | Zero matches in `src/` (config and JSON excluded) |
| Acceptance criteria | Manual review of HANDOFF.md checkboxes | All checked |
| Reviewer sign-off | `review_notes` field populated with APPROVED | Present |

The observer pattern audit and hardcoded-values grep are run as part of a `npm run impeccable` script that will be created as part of the sandbox foundation task.

### Decision 2.4 — Skill Discovery

**Locked:** CLAUDE.md directive in each repo lists which skills apply to that repo's tasks. Additionally, `list_omc_skills` is called at session start to map skills to task types.

Each repo's CLAUDE.md gains a `## Skills` section:

```markdown
## Skills

Skills available for this project (loaded from C:\ClaudeSkills):

- agentforge-autopilot: Use for autonomous multi-step AgentForge tasks
- impeccable: Use before any PR submission to verify quality gate
- ollama-audit-training: Use when adding or modifying Ollama model routing
```

This means an agent opening any repo immediately knows which skills to invoke without being told in the prompt.

---

## Section 3: Chatbot and Model Communication

### Decision 3.1 — Chatbot Interface Location

**Locked:** AgentForge dashboard (existing Next.js app at `localhost:3000`). Extend, do not rebuild.

The existing app already has:
- `src/components/agent-card.tsx` — agent status display
- `src/components/activity-feed.tsx` — event stream display
- `src/components/event-stream.tsx` — SSE consumer
- `src/app/dashboard/` — dashboard layout and page

A new route `src/app/dashboard/chat/` is added with a chat panel component. The Electron/Tauri desktop app remains Phase 5 as specified in CLAUDE.md.

**New files:**
- `src/app/dashboard/chat/page.tsx` — chat route
- `src/components/chat-panel.tsx` — chatbot UI component
- `src/components/model-selector.tsx` — Ollama model picker (auto-populated)

### Decision 3.2 — Model Routing

**Locked:** Task-type routing via existing `src/routing/ModelRouter.ts`.

The ModelRouter already exists. It is extended to cover chatbot task types. When a user sends a message in the chat panel, the message is analyzed for task type (code, creative, analysis, general) and routed to the best available model in the LLM fallback chain.

The user can override routing by selecting a model explicitly from the model selector — this is the "Model selector dropdown" option acting as a manual override on top of automatic routing, not a replacement for it.

### Decision 3.3 — Ollama Auto-Discovery

**Locked:** Yes — all running Ollama models appear automatically as available agents.

On dashboard load, AgentForge calls the Ollama API (`http://localhost:11434/api/tags`) and emits an `ollama:models:discovered` event via the EventBus. The chat panel listens for this event and populates the model list reactively. No manual configuration required.

When Ollama is offline or the API is unreachable, the chat panel shows a "Ollama offline" status pill and falls back to the cloud LLM chain. This is graceful degradation, not an error state.

### Decision 3.4 — Context Sharing

**Locked:** Full project `CLAUDE.md` + current task `HANDOFF.md` only.

When an agent opens a chat session for a specific project task, the system context sent to the model is:

1. The project's `CLAUDE.md` (read from `projects.json` path)
2. The active task's `HANDOFF.md` (current task only)

This fits within every model's context window including smaller Ollama models (7B class). The user can expand context manually via a "Add context" button that opens a file picker constrained to the project's root.

---

## Section 4: PDR Documents (Cursor + Claude Code)

### Decision 4.1 — PDR Scope

**Locked:** One PDR per major subsystem, with an index at `docs/PDR/README.md`.

Additionally, integration with external tools (Notion, Figma boards) is supported via links in each PDR — the PDR is the source of truth, external boards are views into it.

**PDR subsystems:**

| Subsystem | File |
|-----------|------|
| Index | `docs/PDR/README.md` |
| Sandbox and project registry | `docs/PDR/01-sandbox.md` |
| Task system (HANDOFF.md protocol) | `docs/PDR/02-task-system.md` |
| Chatbot and model routing | `docs/PDR/03-chatbot.md` |
| BadgerHeart pipeline integration | `docs/PDR/04-badgerheart-pipeline.md` |
| Impeccable quality gate | `docs/PDR/05-impeccable-gate.md` |

### Decision 4.2 — Cursor Integration Requirements

**Locked:** All five elements are required in every PDR.

1. **Explicit file paths** — every component reference includes its full path from the repo root
2. **Cursor rules** — `.cursor/rules/` directory mirrors CLAUDE.md non-negotiables (observer pattern, no hardcoded values, ES Modules only)
3. **Task breakdown with file-level acceptance criteria** — each PDR section has a tasks table pointing to HANDOFF.md files
4. **Mermaid diagrams** — event flows and agent communication visualized in each PDR
5. **Model routing table** — which task type routes to which model tier

**Cursor rules file:** `.cursor/rules/coding-standards.md`

```markdown
# Coding Standards (mirrors CLAUDE.md non-negotiables)

1. Observer pattern for ALL state changes — no setInterval, no polling loops
2. All defaults in constructors — one place, never scattered
3. No hardcoded values — all config comes from src/config/env.ts or projects.json
4. ES Modules only — no CommonJS require()
5. npm only — never yarn
6. Single-line // comments only — explain WHY not WHAT
7. File headers on every file (path, purpose, dependencies, integration points)
```

### Decision 4.3 — PDR Location

**Locked:** `docs/PDR/` with index at `docs/PDR/README.md`.

Both Cursor (via `.cursor/rules/` referencing `docs/PDR/`) and Claude Code (via CLAUDE.md referencing `docs/PDR/`) load from the same files. No separate copies that can diverge.

CLAUDE.md gains a reference:

```markdown
## PDR Documents

Per-subsystem design records live in docs/PDR/. Read docs/PDR/README.md first for the index.
These are the authoritative source for architecture decisions, file paths, and acceptance criteria.
```

---

## Section 5: BadgerHeart LLC Asset Pipeline Integration

### Decision 5.1 — Pipeline Visibility in Dashboard

**Locked:** BadgerHeart agents register tasks in the shared task system using the same HANDOFF.md format.

MeshyForge, BlenderWorkshop, and FabStorefront each get a `tasks/` directory. Tasks are created with the same HANDOFF.md schema as AgentForge tasks. The AgentForge dashboard reads `projects.json` to discover BadgerHeart repos and aggregates their task counts into the dashboard view.

The existing `src/components/agent-card.tsx` is extended to display BadgerHeart pipeline agents alongside dev agents.

### Decision 5.2 — Revenue Tracking on Dashboard

**Locked:** Yes — `FabStorefront/revenue_tracker.csv` is surfaced on the dashboard alongside the task queue.

A new dashboard widget reads `revenue_tracker.csv` via an API route and displays:
- Monthly revenue vs $1,000 target (progress bar)
- Top-performing listing this month
- Next scheduled Fab event (sale opportunity)

This keeps the $1K/mo revenue goal visible during every dev session.

**New files:**
- `src/app/api/badgerheart/revenue/route.ts` — reads revenue_tracker.csv
- `src/components/revenue-tracker-widget.tsx` — dashboard widget

### Decision 5.3 — BadgerHeart Task Location

**Locked:** Tasks live in `BadgerHeart/<module>/tasks/` mirroring AgentForge structure.

```
C:\Users\daley\Projects\BadgerHeart\
  MeshyForge\tasks\
    TASK-BH-001-batch-scifi-props.md
    TASK-BH-002-quality-gate-review.md
  BlenderWorkshop\tasks\
    TASK-BH-010-cleanup-raven-mage.md
  FabStorefront\tasks\
    TASK-BH-020-list-elemental-kit.md
    TASK-BH-021-list-objectpool.md
```

The `projects.json` registry points to these task directories. AgentForge aggregates them into a unified task view.

---

## Section 6: Phase and Build Priorities

### Phase 1 — Foundation (Ships First)

Everything below must be done before any agent work can start reliably. Phase 1 is the OS itself.

| # | Deliverable | HANDOFF.md |
|---|-------------|------------|
| 1 | Folder structure + `projects.json` registry | `tasks/TASK-001-sandbox-foundation.md` |
| 2 | HANDOFF.md schema + lifecycle documentation | `tasks/TASK-002-handoff-schema.md` |
| 3 | PDR documents (`docs/PDR/` with all 5 subsystem files) | `tasks/TASK-003-pdr-documents.md` |
| 4 | Chatbot interface in AgentForge dashboard | `tasks/TASK-004-chatbot-ui.md` |
| 5 | BadgerHeart pipeline tasks integrated (HANDOFF.md format) | `tasks/TASK-005-badgerheart-tasks.md` |
| 6 | Revenue tracking widget on dashboard | `tasks/TASK-006-revenue-widget.md` |
| 7 | `.cursor/rules/` coding standards file | `tasks/TASK-007-cursor-rules.md` |

### Phase 2 — Core Product

| # | Deliverable | HANDOFF.md |
|---|-------------|------------|
| 8 | Ollama model discovery and routing in chatbot | `tasks/TASK-008-ollama-routing.md` |

### Phase 3 — Enhancement

| # | Deliverable | HANDOFF.md |
|---|-------------|------------|
| 9 | Impeccable test gate as automated `npm run impeccable` script | `tasks/TASK-009-impeccable-gate.md` |

### MVP Phase Assignment (locked)

| Capability | Phase |
|------------|-------|
| Unified sandbox folder structure | Phase 1 |
| Central `projects.json` discovery file | Phase 1 |
| HANDOFF.md schema and lifecycle | Phase 1 |
| PDR document (Cursor + Claude Code) | Phase 1 |
| Chatbot interface in AgentForge dashboard | Phase 1 |
| Ollama model discovery and routing | Phase 2 |
| BadgerHeart pipeline in task system | Phase 1 |
| Impeccable test gate (automated) | Phase 3 |
| Revenue tracking on dashboard | Phase 1 |

---

## Non-Negotiables (from CLAUDE.md — enforced in all tasks)

These are checked by the impeccable gate on every PR:

1. **Observer pattern** — all state changes via EventBus, zero polling
2. **No hardcoded values** — all config from `src/config/env.ts` or `projects.json`
3. **All defaults in constructors** — one place, never scattered
4. **ES Modules only** — no `require()`
5. **npm only** — never yarn
6. **Single-line `//` comments only** — explain WHY
7. **File headers on every file** — path, purpose, dependencies, integration points

---

## Key File Paths (Cursor + Claude Code Reference)

| Component | Path |
|-----------|------|
| Project registry | `projects.json` |
| EventBus | `src/core/events/agent-event-bus.ts` |
| Model router | `src/routing/ModelRouter.ts` |
| Config/env | `src/config/env.ts` |
| Dashboard page | `src/app/dashboard/page.tsx` |
| Chat route (new) | `src/app/dashboard/chat/page.tsx` |
| Chat panel component (new) | `src/components/chat-panel.tsx` |
| Revenue widget (new) | `src/components/revenue-tracker-widget.tsx` |
| Revenue API route (new) | `src/app/api/badgerheart/revenue/route.ts` |
| PDR index | `docs/PDR/README.md` |
| Cursor rules | `.cursor/rules/coding-standards.md` |
| Task root | `tasks/` |
| BadgerHeart task roots | `C:\Users\daley\Projects\BadgerHeart\<module>\tasks\` |

---

## Event Taxonomy (additions to existing EventBus)

```
ollama:models:discovered      — Ollama API returned model list on startup
ollama:models:offline         — Ollama API unreachable, fallback activated
chat:message:sent             — User sent a message in chat panel
chat:message:routed           — ModelRouter assigned message to a model
chat:message:received         — Model response received, render to UI
chat:context:loaded           — CLAUDE.md + HANDOFF.md injected into session
badgerheart:tasks:synced      — BadgerHeart task files read and aggregated
badgerheart:revenue:updated   — revenue_tracker.csv read, widget refreshed
task:checkout                 — Agent created task branch (checkout)
task:submitted                — PR opened (submission)
task:approved                 — Reviewer signed off (gate passed)
task:done                     — PR merged (done)
```

---

## What This Spec Does NOT Cover

- Electron/Tauri desktop packaging (Phase 5 per CLAUDE.md)
- aGenticOS bridge (Phase 6 per CLAUDE.md)
- Claudeinator token monitor integration (Phase 5 per CLAUDE.md)
- New agent implementations beyond what already exists in `src/agents/`
- LLC Mission Control chapter content (separate concern from OS infrastructure)

These are deferred, not cancelled. Each gets its own spec when their phase arrives.

---

## Spec Self-Review

**Placeholder scan:** None found.  
**Internal consistency:** Event taxonomy aligns with existing `agent-event-bus.ts` patterns. File paths verified against current `src/` structure. Phase assignments match locked MVP decisions.  
**Scope check:** 9 HANDOFF.md tasks across 3 phases. Appropriately scoped for a single implementation plan.  
**Ambiguity check:** "HANDOFF.md as PR description" — clarified to mean the HANDOFF.md content (task_id, status, acceptance criteria, review notes) is used as the PR body template, not that the raw file is copy-pasted verbatim.
