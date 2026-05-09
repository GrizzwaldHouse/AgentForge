# AgentForge PRD v3 Full

**Status:** CANONICAL  
**Canonical Since:** 2026-05-04  
**Owner:** Marcus Daley  
**Project Root:** `C:\Users\daley\Projects\SeniorDevBuddy`  
**Primary Product Repo Target:** `AgentForge`  

This file is the single source of truth for AgentForge MVP planning. It supersedes:

- `AgentForge/docs/prd/AgentForge_PRD_v1.md`
- `AgentForge/docs/prd/AGENTFORGE_PRD_v2.md`
- `AgentForge/docs/prd/PRD_v2.md`
- `AgentForge/docs/prd/PRD_v3.md`

Older PRDs remain historical references only. New implementation work, GitHub issues, task boards, and agent prompts should point here first.

## Product Decision

AgentForge should ship as a revenue-first agent control plane, not a broad AI operating system in the first release.

The MVP must prove one end-to-end workflow:

1. Discover a job or client opportunity.
2. Score it against Marcus's profile and business goals.
3. Generate a proposal or response draft.
4. Show the task, reasoning, safety status, and output in the UI.
5. Require Marcus approval before anything external is submitted.
6. Log the full run for review, debugging, and future reuse.

This keeps the project shippable while preserving the larger organ-based architecture as the long-term model.

## Local Source Inventory

Use the following local material when creating the clean GitHub repo and MVP task board.

| Path | MVP Role | Recommendation |
| --- | --- | --- |
| `agentforge_autonomous` | Current working app implementation | Keep as the main implementation source. It already contains the Next.js app, agents, routes, safety layer, observability, tests, and Electron setup. |
| `AgentForge` | Canonical contracts, runtime, docs, schemas, and PRDs | Keep as the canonical specification and contract source. Move only validated runtime/contracts into the product repo. |
| `AgentForge_Baseline` | Audit evidence and system map | Keep as planning evidence. Do not ship this as runtime code. Use `baseline_summary.md`, `completeness_report.json`, and inconsistency reports for task creation. |
| `AgentForge_Extracted` | Extracted bundles and legacy archives | Archive. Pull only unique docs or validated code after review. Do not copy wholesale. |
| `docs` | Supporting superpowers and process docs | Keep only docs that directly help the AgentForge build workflow. |
| `session-prompts` | Prompt templates | Keep selected prompts as `docs/prompts/` or `.agents/prompts/` after pruning duplicates. |
| `skills` | Local skill references | Keep as reference material. Do not make every skill part of the MVP. |
| `grizz_modular_system`, `grizz_modular_system_fixed`, `grizz_ultimate_system` | Earlier agent/skill experiments | Archive for ideas. Not MVP runtime. |
| Gmail zip/packages | Email automation experiments | Defer. Useful later for outreach, but not needed for the first revenue workflow. |
| Root docs: `AGENT_FORGE_MASTER_PROMPT.md`, `AGENT_TASK_TEMPLATE.md`, `ARCHITECTURE.md`, `OBSERVER_PATTERNS.md`, `QUALITY_CHECKLIST.md`, `UNIFICATION_PLAN.md` | Requirements and architecture inputs | Keep as source references. Extract decisions into this PRD, ADRs, and GitHub issues. |
| Zip files | Historical bundles | Do not commit into the clean GitHub repo. Preserve locally or move to an archive outside the product repo. |

## MVP Features To Keep

These are the features that should remain in the MVP because they support the first shippable workflow.

| Priority | Feature | Why It Stays | Existing Source |
| --- | --- | --- | --- |
| P0 | Event bus and typed event contracts | AgentForge must be observable and event-driven from day one. | `AgentForge/runtime`, `AgentForge/contracts`, `agentforge_autonomous/src/core/events` |
| P0 | Agent orchestrator with supervisor boundaries | Needed to run Planner, Builder, Reviewer, Tester, and safety checks without uncontrolled loops. | `agentforge_autonomous/src/orchestrator`, `agentforge_autonomous/src/backend/services` |
| P0 | Job/opportunity workflow | This is the first revenue path. | `agentforge_autonomous/src/app/api/jobs`, `agentforge_autonomous/src/job-system` |
| P0 | Proposal and resume draft generation | Converts matched opportunities into usable output. | `agentforge_autonomous/src/app/api/jobs/generate-cover-letter`, `generate-resume` |
| P0 | Human approval and safety layer | Prevents autonomous external actions and gives Marcus final control. | `agentforge_autonomous/src/safety` |
| P0 | Dashboard, narrative panel, output panel, event stream | Makes current work visible and reviewable. | `agentforge_autonomous/src/components`, `src/app/dashboard` |
| P0 | Provider abstraction for local and fallback models | Keeps Ollama-first execution without vendor lock-in. | `agentforge_autonomous/src/backend/execution`, `src/backend/services/LLMProviderChain.ts` |
| P0 | Config validation | Prevents hidden setup failures and hardcoded values. | `agentforge_autonomous/src/config/env.ts` |
| P0 | Tests for core events, orchestration, safety, and execution backends | Required before GitHub repo creation and CI. | Existing `__tests__` folders |
| P1 | Knowledge base and lightweight retrieval | Useful for grounding proposals in Marcus's real history. | `agentforge_autonomous/src/agents/learning`, future Chroma integration |
| P1 | Playwright-backed browser actions | Useful for job-board extraction and UI verification. | Existing Playwright docs plus future integration |
| P1 | Electron desktop packaging | Keep only after web MVP is stable. | `agentforge_autonomous/electron` |

## Features To Defer

These are valuable, but they should not block the first GitHub repo and MVP.

| Feature | Decision | Reason |
| --- | --- | --- |
| Full AI OS branding and all organ subsystems | Defer implementation depth | Keep the metaphor in docs, but ship one working pipeline first. |
| Gmail automation | Phase 2 | Useful for outreach, but job/proposal workflow is the cleaner first revenue path. |
| 3D asset generation, rigging, voice, image generation | Phase 2 or 3 | Interesting portfolio value, but large GPU and licensing surface area. |
| Multi-tenant client dashboard | Phase 3 | Marcus is the first user. Avoid SaaS complexity until the solo workflow works. |
| Payment and licensing system | Phase 3 | Productized pipelines come after repeated manual success. |
| Mobile app or PWA polish | Phase 3 | Desktop/web review UI is enough for MVP. |
| Full self-improving/autonomous retraining loop | Defer | Keep logs and feedback now; build learning automation after enough real runs exist. |
| n8n as core runtime | Optional integration only | n8n is source-available/fair-code, not a simple permissive dependency. Use it for optional workflows, not the core control plane. |

## MVP Architecture

```text
User Request or Job Event
  -> Event Bus
  -> Orchestrator
  -> Job/Task Agent
  -> Model Provider Chain
  -> Proposal or Task Output
  -> Safety Guard
  -> Dashboard Review
  -> Marcus Approval
  -> Logged Completion
```

### Required Boundaries

- No polling loops for internal state changes. Components emit and subscribe to events.
- No external submission without explicit human approval.
- No hardcoded model names, thresholds, URLs, credentials, or business rules.
- No agent self-approval.
- Every important run writes structured logs with task ID, agent ID, model/provider, timing, result, errors, and approval status.
- Every new public or exported function must include clear function documentation following `AGENTS.md`.

## GitHub Repo Recommendation

Create a clean repo for AgentForge instead of pushing the entire `SeniorDevBuddy` folder.

Recommended target:

- **Repository name:** `AgentForge`
- **Suggested owner:** `GrizzwaldHouse` or Marcus's preferred GitHub account
- **Initial visibility:** Private until secrets, archives, zips, generated files, and unfinished bundles are removed
- **Default branch:** `main`
- **Branch protection:** Require PR review, status checks, and no direct pushes to `main`

### Seed The Repo With

- `AGENTS.md`
- `README.md` with product summary, quick start, and MVP task board
- `docs/prd/PRD_v3_FULL.md`
- `docs/adr/` for architecture decisions
- `docs/prompts/` for curated agent prompts
- `src/` from `agentforge_autonomous/src` after cleanup
- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`
- `AgentForge/contracts`, `AgentForge/runtime`, and `AgentForge/schemas` after reviewing imports
- `.env.example`, never `.env.local`
- `.gitignore` that excludes `.next`, `node_modules`, logs, zips, generated reports, and local secrets

### Do Not Seed With

- Zip bundles
- `.next`
- `node_modules`
- `.env.local`
- `tsconfig.tsbuildinfo`
- Extracted archives unless reviewed file-by-file
- Placeholder PRDs as active docs
- Local-only baseline JSON reports as runtime assets

## Open Source Reuse Recommendations

Favor proven open-source projects for generic infrastructure and keep AgentForge focused on Marcus-specific workflow, UI, safety, and business logic.

| Need | Recommended Reuse | How To Use It | MVP Decision |
| --- | --- | --- | --- |
| Stateful agent workflow orchestration | [LangGraph](https://github.com/langchain-ai/langgraph) or [LangGraph.js](https://github.com/langchain-ai/langgraphjs) | Use graph primitives, checkpointing, streaming, and human-in-the-loop patterns instead of inventing a graph engine. | Evaluate for replacing or strengthening custom orchestration after the current event bus is stabilized. |
| Coding-agent reference implementation | [OpenHands](https://github.com/OpenHands/OpenHands) | Study local GUI, SDK, CLI, sandboxing, and software-agent architecture. Do not embed the whole project. | Reference architecture only for MVP. |
| Provider routing, budgets, and fallback | [LiteLLM](https://docs.litellm.ai/) | Use as a proxy or reference for unified model calls, retries, budget tracking, and provider fallback. | Strong Phase 1 candidate if custom provider chain becomes fragile. |
| Tool/plugin protocol | [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Expose AgentForge tools, resources, prompts, and integrations through standard MCP interfaces. | P1, after core workflow runs. |
| Browser automation and UI testing | [Playwright](https://github.com/microsoft/playwright) | Use for job-board extraction fallback, UI tests, screenshots, traces, and future Playwright MCP agent control. | Keep. Add as first-class test and automation layer. |
| Vector memory and retrieval | [Chroma](https://github.com/chroma-core/chroma) | Store Marcus profile, project summaries, proposal history, job embeddings, and deduplication metadata. | P1, after JSON MVP or immediately if retrieval is needed. |
| Type-safe database access | [Prisma ORM](https://docs.prisma.io/docs/orm) | Use schema, migrations, and type-safe DB access for job/proposal/application tables. | P1 if the app moves beyond JSON/local file storage. |
| Business workflow automation | [n8n](https://github.com/n8n-io/n8n) | Optional external workflow runner for integrations and handoff automation. | Defer. License and security posture require review before core dependency. |
| Python/.NET enterprise agent patterns | [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) | Reference graph workflows, DevUI, OpenTelemetry, and migration guidance. | Reference only unless AgentForge adds Python/.NET workers. |
| Role-based multi-agent crews | [CrewAI](https://docs.crewai.com/en/introduction) | Useful for business automation prototypes with Crews and Flows. | Defer because current stack is TypeScript/Next-first. |

## Recommended MVP Backlog

### Milestone 0: Repo Hygiene

- Mark this file as canonical in README and future GitHub issues.
- Create a clean `AgentForge` GitHub repo from selected files only.
- Add branch protection and CI before feature work.
- Remove or archive placeholder PRDs from active navigation.
- Ensure `.env.local`, zips, `.next`, `node_modules`, and generated reports are ignored.

### Milestone 1: End-to-End Local Run

- Run the current Next.js dashboard locally.
- Confirm `npm.cmd test` passes or capture failures as GitHub issues.
- Confirm the event stream can show an agent task from start to finish.
- Confirm safety approvals block external action until Marcus approves.

### Milestone 2: Revenue Workflow

- Implement or stabilize job intake.
- Implement or stabilize job scoring.
- Generate proposal/resume draft output.
- Show source reasoning, confidence, and editable output in the UI.
- Save every application attempt and status.

### Milestone 3: Quality Gate

- Add CI for typecheck, tests, lint/build where supported.
- Add Playwright smoke tests for dashboard, jobs, proposal generation, and safety approval.
- Add structured run logs for every agent.
- Add a supervisor review checklist to PR templates.

### Milestone 4: Reuse And Hardening

- Decide whether custom orchestration stays or LangGraph.js replaces part of it.
- Decide whether LiteLLM proxy replaces custom provider fallback.
- Add Chroma or another vector store only when retrieval is required by real proposals.
- Add MCP interfaces for tool reuse after the first workflow is stable.

## Success Metrics

MVP success is not measured by number of agents. It is measured by completed, reviewable work.

- One full job-to-proposal workflow completes locally.
- Marcus can review and approve output before external action.
- Every run is visible in the dashboard and saved in logs.
- Tests cover event bus, orchestrator, provider fallback, safety approval, and proposal output.
- GitHub repo contains only active product files and has no secrets or archive noise.
- The system helps produce at least five real proposal drafts for Marcus review.

## Open Questions

- Should the first GitHub repo be private under a personal account or under `GrizzwaldHouse`?
- Should the clean repo preserve the current `agentforge_autonomous` folder name or become a normalized repo root?
- Should MVP persistence stay JSON-first for speed, or move directly to Prisma/SQLite for stronger task tracking?
- Should LangGraph.js be introduced immediately, or should the current event bus/orchestrator be stabilized first?
- Which job source is safest for the first MVP: manual paste, RSS/API, or Playwright-assisted extraction?
