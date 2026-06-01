# Session Handoff - AgentForge

## Current Phase
**Phase 9+ — Job Pipeline + A5 Resume VMock Pipeline (active as of 2026-06)**

Phases 1-8 (Foundation through Integration) are complete or superseded. The system is no longer following the original Phase 3-8 plan (SimulatedBackend, ObservableOrchestrator). That architecture was replaced by the job pipeline in April-May 2026.

## Completed Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Foundation: core interfaces, event bus, agent registry | COMPLETE |
| 2 | Event System: SSE endpoint, run/route.ts, React hook | COMPLETE |
| 3-8 | Execution backends, orchestrator, session persistence, UI | SUPERSEDED by job pipeline |
| 9 | Job pipeline (A1-A4): ingestion, matching, proposal, critic, output | COMPLETE |
| A5 | Resume VMock pipeline: HF selection, Playwright scorer, iteration loop | COMPLETE (2026-06-01) |

## Active Files (current session)

### A5 Resume Pipeline (new as of 2026-06-01)
- `src/agents/resume-pipeline/resume-pipeline-events.ts`
- `src/agents/resume-pipeline/ResumeSelectionAgent.ts`
- `src/agents/resume-pipeline/VmockRunnerAgent.ts`
- `src/agents/resume-pipeline/ResumePipelineOrchestrator.ts`
- `agents/A5-auto-apply/config.ts`
- `agents/A5-auto-apply/setup-vmock-auth.mjs`
- `agents/A5-auto-apply/corpus/jd-keywords.json`
- `agents/A5-auto-apply/corpus/resume-vocab.json`

### Job Pipeline (Phase 9, complete)
- `src/agents/job-pipeline/` -- A1-A4 agents + orchestrator + events
- `apps/job-agent/config/` -- settings.json, config-loader.ts
- `src/core/events/agent-event-bus.ts` -- singleton event bus

## Build Status
- `npx vitest run src/agents/resume-pipeline/` -- 16/16 tests pass
- `npm run build` -- PASS

## Blockers Before A5 Can Run End-to-End
1. Resume vault path confirmed (default: `C:/Users/daley/Resumes`)
2. VMock DOM selectors replaced in `apps/job-agent/config/settings.json` after live inspection
3. `HF_BEARER_TOKEN` added to `.env`
4. VMock login method confirmed (SSO vs email/password) -- run `setup-vmock-auth.mjs` once

## How to Resume
```bash
cd agentforge_autonomous
npm run dev          # Start Next.js dashboard
npm run resume       # Generate Claude Code resume prompt
npx vitest run       # Run all tests
```

## Branch
`feat/pdf-session-1-weasyprint` (A5 work committed here, merge to main when blockers cleared)
