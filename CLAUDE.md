# CLAUDE.md — AgentForge Control Plane

**Repo:** AgentForge  
**Owner:** Marcus Daley (@GrizzwaldHouse)  
**Role in ecosystem:** Heart + Control Plane — orchestrates all other GrizzwaldHouse repos  
**Last Updated:** 2026-05-03

---

## What This Repo Is

AgentForge is the AI operating system control plane. It is a Next.js 15 app that:
- Orchestrates multi-agent workflows via an event-driven architecture
- Provides a real-time dashboard for observing agent execution
- Enforces safety policies (kill switch, approval gates, audit log)
- Routes tasks to local (Ollama) and cloud LLM providers via a cost-conscious fallback chain
- Audits all other GrizzwaldHouse repos for AgentForge integration readiness

## Architecture: Biomechanical Organ Model (PRD v2)

| Organ | Role | Key Files |
|-------|------|-----------|
| Heart | Orchestrator / DSL state machine | src/orchestrator/SupervisorOrchestrator.ts |
| Nervous System | Event Bus (SSE + in-memory) | src/core/events/agent-event-bus.ts |
| Brain | Knowledge graph / BrainstormAgent | src/agents/brainstorm/ |
| Muscles | LLM execution backends | src/backend/execution/ |
| Skin | Safety layer (kill switch, approval) | src/safety/ |
| Endocrine | Config / env | src/config/env.ts |
| Skeletal | Contracts / interfaces | agentforge-spec/contracts/ |
| Lymphatic | Observability (logger, trace, heal) | src/core/observability/, src/healing/ |

## Build & Dev Commands

```bash
npm run dev          # Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
```

## Key Architectural Rules (Non-Negotiable)

1. Event-driven only — no polling (no setInterval, no setTimeout loops, no while(true))
2. No direct agent-to-agent calls — all communication via EventBus
3. No hardcoded URLs or model names — all config-driven via src/config/env.ts
4. LLM provider chain: Ollama -> Groq -> Cerebras -> Together -> Mistral -> Claude -> OpenAI
5. Daily LLM budget: $1.00
6. ES Modules only — no CommonJS require()
7. npm only — never yarn

## AgentForge Ecosystem

This repo is the hub. Other repos plug in as organ components:

```
C:\Users\daley\Projects\
  AgentForge\          <- YOU ARE HERE (control plane)
  cowork-skills\       <- Skill library
  BrightForge\         <- Component repo
  Bob-AICompanion\     <- LLM automation (Muscles)
  VetAssist\           <- Vertical app
  portfolio-website\   <- UI (Next.js, Netlify)
  agentforge-control\  <- Audit orchestrator GUI
```

## Audit Integration

Each external repo contains:
- REPO_AUDIT_AGENT.md — Claude Code audit prompt
- .agentforge/audit_result.json — machine-readable audit result
- STATUS.md — human-readable compliance scorecard

Run: python3 C:\Users\daley\Projects\agentforge-control\agentforge_control.py

## Spec & Baseline

- agentforge-spec/ — Canonical contracts, schemas, PRDs from ChatGPT design session (2026-05-03)
- agentforge-baseline/ — 14-file baseline analysis of current system state (2026-05-03)

## Deployment

- Local dev: npm run dev
- Production: Netlify (NOT Vercel)
- Desktop: Tauri (planned, Phase 5)

## Current Status (2026-05-03)

| Organ | Status |
|-------|--------|
| Heart | PARTIAL — SupervisorOrchestrator is stub, needs real DSL implementation |
| Nervous System | EXISTS |
| Brain | EXISTS |
| Muscles | EXISTS |
| Skin | EXISTS |
| Endocrine | EXISTS |
| Skeletal | EXISTS |
| Lymphatic | EXISTS |

Next priority: Implement Heart (SupervisorOrchestrator) as a real DSL state machine.
