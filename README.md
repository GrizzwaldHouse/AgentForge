# AgentForge

AgentForge is a revenue-first agent control plane for Marcus Daley's freelance and portfolio workflow.

The MVP focuses on one complete workflow: discover an opportunity, score it, draft proposal material, show the work in a review UI, require Marcus approval, and log the full run.

## Canonical Planning

- Product requirements: `docs/prd/PRD_v3_FULL.md`
- Architecture decision: `ARCHITECTURE_DECISION.md`
- Agent instructions: `AGENTS.md`

Older PRDs in `docs/prd/` are retained as historical references only.

## MVP Scope

Keep:

- Event bus and typed contracts
- Agent orchestration with supervisor boundaries
- Job/opportunity workflow
- Proposal and resume draft generation
- Human approval and safety layer
- Dashboard visibility for events, reasoning, outputs, and status
- Provider abstraction for local and fallback models
- Config validation and test coverage

Defer:

- Gmail automation
- 3D, image, voice, and rigging pipelines
- Multi-tenant client dashboard
- Payment and licensing system
- Mobile/PWA polish
- Fully self-improving retraining loops

## Repository Status

This repository is being prepared as the clean GitHub home for AgentForge.

Do not commit local archives, generated build output, private environment files, or extracted bundle dumps.
