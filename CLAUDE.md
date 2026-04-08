# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

SeniorDevBuddy is Marcus Daley's AI development orchestration system. It contains three generations of system prompts and a TypeScript implementation:

- **`grizz_modular_system/`** — Active system. Markdown-based orchestrator with SYSTEM_PROMPT.md as the entry point and four tracking files (SKILLS.md, TASKS.md, AGENTS.md, LEARNING.md).
- **`grizz_modular_system_fixed/`** — Mirror copy of the above. Must stay in sync after every update.
- **`grizz_ultimate_system/`** — Legacy monolithic vision doc (MASTER.md). Reference only, do not modify.
- **`agentforge_autonomous/`** — TypeScript/Next.js implementation of the multi-agent system with a dashboard UI.

## Build & Dev Commands (agentforge_autonomous)

```bash
cd agentforge_autonomous
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run resume       # Session resume script
npm run ollama:resume     # Ollama-powered session resume
npm run ollama:dry-run    # Dry run of Ollama resume
```

No test runner is configured yet. CI is a placeholder (`.github/workflows/ci.yml` just echoes).

## Architecture

### Grizz Modular System (Markdown Orchestrator)

The system defines a 10-step execution loop: DETECT → EXTRACT → MATCH → GENERATE → PLAN → BUILD → REVIEW → TEST → REFACTOR → LEARN. Tracking files update each cycle.

**12 agents** organized in two groups:
- **7 core**: Planner, Builder, Reviewer, Test, Refactor, Learning, TokenMonitor
- **5 Ollama audit**: Audit, Benchmark, Selector, Optimizer, Dashboard

Agent communication flows through TASKS.md: `PlannerAgent → TASKS.md → BuilderAgent → ReviewerAgent → TestAgent → DONE`. The LearningAgent observes all outputs. TokenMonitorAgent handles context pruning.

Task lifecycle: `PENDING → IN_PROGRESS → REVIEW → DONE` (or `BLOCKED`).

### AgentForge Autonomous (TypeScript Implementation)

Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Radix UI + Framer Motion.

**Core interfaces** (`src/core/interfaces/Agent.ts`):
- `Agent` — `{ id, name, execute(input) → AgentOutput }`
- `AgentInput` — `{ taskId, context }`
- `AgentOutput` — `{ success, data?, logs[] }`

**Agent implementations** in `src/agents/{role}/` — each implements the Agent interface. Currently skeleton stubs.

**Orchestrator** (`src/backend/services/AgentOrchestrator.ts`) — takes an array of Agents, runs all in parallel via `Promise.all`.

**ModelService** (`src/backend/services/ModelService.ts`) — detects and recommends local LLM models.

Path alias: `@/*` maps to `./src/*` (tsconfig paths).

Entry point for Claude bootstrap instructions: `claude_autonomous_bootstrap.ts`.

## System Rules (Non-Negotiable)

1. No direct main branch commits — use feature branches
2. Test before merge
3. ES Modules only — no CommonJS
4. npm only — never yarn
5. Netlify for web deployment — never Vercel
6. Free-tier LLM providers first (Ollama → Groq → Cerebras → Together → Mistral → Claude → OpenAI)
7. Daily LLM budget: $1.00
8. All errors logged to LEARNING.md
9. SSH (ed25519) for Git auth

## Keeping Systems in Sync

After modifying any file in `grizz_modular_system/`, copy the same change to `grizz_modular_system_fixed/`. The five files that must stay mirrored:
- SYSTEM_PROMPT.md
- SKILLS.md
- TASKS.md
- AGENTS.md
- LEARNING.md

## Skill Registry

Skills are tracked in `grizz_modular_system/SKILLS.md` (44 total). Before creating a new skill, check:
1. `C:\ClaudeSkills\skills\` (production)
2. `C:\ClaudeSkills\Example_Skills\` (reference)
3. SKILLS.md registry
4. Project codebases for existing patterns

## External Dependencies

- **C:\ClaudeSkills** — Shared skill library (separate git repo)
- **Bob-AICompanion** — LLM fallback chain, Discord webhooks, job pipeline patterns
- **WizardJam 2.0** — UE5 component architecture, behavior trees, delegates
- **Agent-Alexander** — EventBus/SSE, connector interface, retry/circuit breaker patterns
- **Local Ollama models**: llama3.3:70b (42GB), glm-4.7-flash (19GB), llama3:8b (4.7GB)
