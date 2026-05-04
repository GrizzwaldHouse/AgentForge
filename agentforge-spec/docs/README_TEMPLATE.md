# AgentForge

**Owner:** Marcus Daley  
**Status:** ACTIVE — Phase 1 (MVS)  
**Last Updated:** 2026-05-03  

A solo-operated agentic platform that finds freelance contracts, generates proposals, and packages automation pipelines as sellable services.

---

## Quick Start

```bash
cp .env.example .env
# Fill in HF_TOKEN, OPENAI_API_KEY, SUPABASE_URL, etc.
npm install
npm run bootstrap
```

---

## Agent Task Board

This table is the source of truth for all work in progress. Every agent session must update this before starting and after completing work. No task is DONE until a Supervisor session has reviewed the PR.

### Phase 1 (MVS)

| Task ID | Agent ID | Description | Status | Session | Supervisor | Timestamp |
|---------|----------|-------------|--------|---------|------------|-----------|
| T001 | A1 | Job Ingestion scaffold (Upwork RSS) | PENDING | — | — | — |
| T002 | A1 | Deduplication and JSON storage | PENDING | — | — | — |
| T003 | A1 | Playwright fallback scraper | PENDING | — | — | — |
| T004 | A2 | Capability profile config | PENDING | — | — | — |
| T005 | A2 | Job scoring engine | PENDING | — | — | — |
| T006 | A2 | Score threshold filtering | PENDING | — | — | — |
| T007 | A3 | Proposal template system | PENDING | — | — | — |
| T008 | A3 | Local Qwen3 integration | PENDING | — | — | — |
| T009 | A3 | HF Inference fallback | PENDING | — | — | — |
| T010 | A4 | Upwork format output | PENDING | — | — | — |
| T011 | A4 | Email format output | PENDING | — | — | — |
| T012 | A5 | Token budget monitoring | PENDING | — | — | — |
| T013 | A5 | Model switch logic | PENDING | — | — | — |
| T014 | INFRA | Event bus (OwlWatcher scaffold) | PENDING | — | — | — |
| T015 | INFRA | VRAM watchdog | PENDING | — | — | — |
| T016 | INFRA | Config module | PENDING | — | — | — |
| T017 | INFRA | Monorepo scaffold | PENDING | — | — | — |

### Phase 2 (Weeks 2-4)

| Task ID | Agent ID | Description | Status | Session | Supervisor | Timestamp |
|---------|----------|-------------|--------|---------|------------|-----------|
| T018 | A6 | Skill Loader | PLANNED | — | — | — |
| T019 | A7 | Event Router | PLANNED | — | — | — |
| T020 | A8 | QA Validator | PLANNED | — | — | — |
| T021 | A9 | Deployment Agent | PLANNED | — | — | — |
| T022 | A10 | UI Agent | PLANNED | — | — | — |
| T023 | A11 | Portfolio Chat Agent | PLANNED | — | — | — |
| T024 | A14 | Veteran Grant Scout | PLANNED | — | — | — |

### Phase 3 (Month 2+)

| Task ID | Agent ID | Description | Status | Session | Supervisor | Timestamp |
|---------|----------|-------------|--------|---------|------------|-----------|
| T025 | A12 | 3D Asset Pipeline | PLANNED | — | — | — |
| T026 | A13 | Voice Interface | PLANNED | — | — | — |
| T027 | A15 | SaaS Packager | PLANNED | — | — | — |

---

## Non-Negotiables (Read Before Writing Code)

See /prompts/CLAUDE_CODE_ONBOARDING.md for the full list. Summary:

- No hardcoded values. Ever.
- No polling loops. Ever.
- Observer pattern for all agent communication.
- VRAM check before every model load.
- HF Hub URL in every model reference comment.
- Tests are required, not optional.
- No EM dashes in code or docs.

---

## Architecture

```
PIPELINE 1: FIND MONEY
Job Board Events -> OwlWatcher -> A1 -> A2 -> A3 -> A4 -> Application

PIPELINE 2: SHOW CAPABILITY (Phase 2)
Portfolio Visitor -> A11 Chat -> Qwen3 -> Kokoro -> Response

PIPELINE 3: EARN RESIDUAL (Phase 3)
Working Pipeline -> A15 Packager -> Stripe -> Cloudflare -> Client
```

---

## Docs

- [PRD v2.0](/docs/AGENTFORGE_PRD_v2.md) — Full system design, failure analysis, build plan
- [Onboarding Prompt](/prompts/CLAUDE_CODE_ONBOARDING.md) — Paste at start of every agent session
- [Skills Reference](/skills/AGENTFORGE_SKILLS.md) — Reusable patterns and verified model list
- [Workflows](/workflows/AGENTFORGE_WORKFLOWS.md) — Event sequences for all pipelines

---

## Veteran Opportunity Watch

| Item | Deadline | Status |
|------|----------|--------|
| Childcare income documentation (July 2026) | 2026-07-01 | ACTION REQUIRED |
| VET TEC 2.0 reauthorization watch | ~2026-06 | MONITORING |
| SBA SBIR Phase I | Rolling | PENDING REVIEW |

---

## Sign-Off Protocol

1. Claim task by writing session ID to task board above.
2. Write code, write tests.
3. Open PR with label: `NEEDS-REVIEW`
4. Supervisor session reviews and adds: `SUPERVISOR-APPROVED`
5. Update task board: mark DONE, record timestamp.
6. No self-approval.
