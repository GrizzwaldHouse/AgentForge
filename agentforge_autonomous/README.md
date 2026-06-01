# AgentForge Autonomous

Multi-agent AI development platform built by Marcus Daley (Badger Heart LLC). Orchestrates job discovery, resume tailoring, VMock scoring, and proposal generation as a fully automated pipeline.

## What This Does

1. **Job ingestion (A1)** -- reads job postings from JSON sources or Gmail (Phase 2)
2. **Job matching (A2)** -- keyword overlap scoring against skills profile
3. **Proposal generation (A3)** -- Claude/Ollama-powered Upwork proposal drafting
4. **Critic review (A4)** -- scores proposals against rejection patterns, requests revisions
5. **Application output (A4)** -- writes verified proposal + job metadata to `outputs/applications/`
6. **Resume pipeline (A5)** -- selects best resume via HF cosine similarity, uploads to VMock via Playwright, iterates until score passes threshold

## Tech Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Radix UI, Framer Motion
- Vitest for unit tests
- Playwright for browser automation (VMock)
- Hugging Face Inference API (sentence-transformers, BERT NER)
- LLM provider chain: Ollama -> Groq -> Cerebras -> Mistral -> Claude (cost-first)

## Quick Start

```bash
cd agentforge_autonomous
npm install
npm run dev          # Next.js dashboard at localhost:3000
npm run resume       # Generate session resume prompt
npx vitest run       # Run all tests
```

## Project Structure

```
src/
  agents/
    job-pipeline/        # A1-A4: ingestion, matching, proposal, critic, output
    resume-pipeline/     # A5: HF selection, VMock Playwright runner, iteration loop
    gmail/               # Gmail MCP classification and response agents
    brainstorm/          # Brainstorm artifact agent
  core/
    events/              # agentEventBus singleton + typed event schemas
    interfaces/          # Agent, AgentInput, AgentOutput interfaces
  backend/
    services/            # LLMProviderChain, ModelService, AgentOrchestrator
apps/
  job-agent/
    config/              # settings.json (pipeline, model, paths, resume config)
agents/
  A5-auto-apply/         # CLI scripts: config.ts, setup-vmock-auth.mjs, corpus/
```

## A5 Resume Pipeline Setup

Before the resume pipeline can run end-to-end:

1. Confirm resume vault path in `apps/job-agent/config/settings.json` (`resume.vaultPath`)
2. Add `HF_BEARER_TOKEN` to `.env`
3. Run `node agents/A5-auto-apply/setup-vmock-auth.mjs` to save VMock session
4. Replace `vmockSelectors` in `settings.json` after inspecting VMock DOM live

## Configuration

All runtime config lives in `apps/job-agent/config/settings.json`. No magic strings in agent code.

## Rules

- ES Modules only (no CommonJS)
- npm only (no yarn)
- Free-tier LLMs first (Ollama > Groq > Cerebras > Mistral > Claude)
- Daily LLM budget: $1.00
- No em dashes in any output
- Feature branches only -- no direct main commits
