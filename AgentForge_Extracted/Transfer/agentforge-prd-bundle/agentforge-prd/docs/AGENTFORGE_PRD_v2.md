# AgentForge PRD v2.0
**Author:** Marcus Daley  
**Date:** 2026-05  
**Status:** ACTIVE — Revenue-First Execution  
**Classification:** Principal-Level Systems Architecture  

---

## CHATGPT AUDIT — What Was Right, What Was Wrong

Before any agent builds against the previous ChatGPT output, the following errors must be flagged. Agents must reject incorrect upstream data rather than propagate it.

### Confirmed Correct
- VRAM constraint is real: 24 GB cannot load all listed models simultaneously. The SLOT system is the right solution.
- Hunyuan3D-2.1 commercial restriction in EU/Korea/China is accurate. SPAR3D (MIT) is the correct default for client work.
- Qwen3-Coder as local default coder is accurate and well-supported.
- HF Inference Providers unify multiple backends under one OpenAI-compatible API. Correct.
- ZeroGPU burst compute via HF Spaces is real. PRO tier does give more time.
- Kokoro-82M, Whisper-large-v3-turbo, OpenVoice V2 licensing and capabilities are accurately described.

### Confirmed Wrong — Agents Must Not Build Against These
- "GPT-OSS-20B (Apache-2.0)" does not exist as described. No such model exists on HF Hub under that name or license at this time. Use Llama 3.3-70B (Meta Llama license, commercial-friendly) or Qwen3-72B (Apache-2.0) for heavy reasoning fallback.
- "LLaMA 3.6 CherryTorch branch 27B" does not exist. No such release exists. Closest real option is Llama 3.3-70B or Qwen3-30B-A3B.
- Model simultaneous loading claims are optimistic. The listed pipeline does not fit in 24 GB all at once. The SLOT system in Section 5 is mandatory, not optional.
- The HF PRO plan free credit amount ($9/mo = 2M tokens) is an approximation and varies by provider and model. Agents must not hardcode token budget assumptions.

### ChatGPT Verification Prompt (Save and Reuse)
When using ChatGPT for technical research, prepend the following to any query:

> Before you answer: If you are uncertain about a specific model name, license, version number, VRAM requirement, or API specification, say "UNVERIFIED" next to that claim and explain the uncertainty. Do not invent model names, version numbers, or hardware specs. Do not cite a model as Apache-2.0 without confirming the license page on huggingface.co. If you cannot verify something, say so explicitly rather than presenting it with false confidence.

---

## 1. OBJECTIVE

Build a revenue-generating, solo-operated agentic platform that serves three simultaneous functions:

1. **Income engine** — Finds, matches, and applies to freelance contracts autonomously (Upwork, LinkedIn, Contra, Dice, We Work Remotely).
2. **Portfolio showcase** — Demonstrates AI integration, game development, and veteran-specific technical depth to employers and clients.
3. **Residual revenue platform** — Packages working automation pipelines into sellable SaaS tiers or licensed tools.

AgentForge is not a prototype. It is a production system built to run for years across multiple client verticals.

**Marcus's Unfair Advantages (Every agent must know this):**
- Veteran status and clearance eligibility (DoD simulation contracts at General Atomics, Cubic, Anduril, Shield AI, Booz Allen)
- 8 years torpedoman + 3 years shipyard safety supervisor = weapons systems and safety-critical systems credibility
- Full Sail CS + Game Dev degree (February 2026) with active UE5/C++ project portfolio
- GrizzwaldHouse public GitHub with four AI-integrated projects
- VR&E Chapter 31 educational benefit status (VET TEC 2.0 watch for June 2026 reauthorization)
- Wife is active duty Navy nursing officer (commissioning 2028) = household financial stability runway

---

## 2. SYSTEM BREAKDOWN

### 2.1 Inference Layer

**Local (RTX 4090, 24 GB VRAM)**

| Slot | Model | Task | VRAM |
|------|-------|------|------|
| SLOT_A | Qwen3-Coder-30B-A3B-Instruct (Apache-2.0) | Coding, reasoning, proposal drafting | ~16 GB |
| SLOT_A_ALT | Qwen3-VL-8B (Apache-2.0) | Vision, screenshot reading, OCR | ~10 GB |
| SLOT_B | FLUX.2-klein-4B (Apache-2.0) | Image generation | ~13 GB |
| SLOT_B | SPAR3D (MIT) | 3D prop/background generation | ~6 GB |
| SLOT_B | Kokoro-82M (Apache-2.0) | TTS output | ~1 GB |
| SLOT_B | Whisper-large-v3-turbo (MIT) | ASR input | ~3 GB |

**Rules for the SLOT system:**
- SLOT_A and SLOT_B cannot run simultaneously unless combined VRAM is under 22 GB.
- A VRAM watchdog process monitors `nvidia-smi` before any model load and blocks the load if headroom is insufficient.
- All SLOT assignments are defined in a config file, not hardcoded.

**Cloud Fallback (HF Inference Providers)**

| Model | Provider | Use Case |
|-------|----------|----------|
| Qwen3-72B (Apache-2.0) | Cerebras/Groq | Complex multi-step planning |
| Llama 3.3-70B | Cerebras/Groq | Heavy reasoning fallback |
| Qwen3-Coder-480B | Groq | Maximum code quality |

### 2.2 Agent Orchestration Layer

- **AgenticOS** — State machine and workflow runner. All agents register here. No agent runs outside the registry.
- **OwlWatcher** — Event-driven trigger system. Monitors job boards, file system events, API webhooks. Zero polling loops allowed.
- **Supervisor Session** — A dedicated Claude or Qwen3 session that reviews agent output before marking tasks DONE.

### 2.3 Data Layer

| Component | Technology | Scope |
|-----------|------------|-------|
| Primary store | JSON files (local) | MVP phase |
| Vector store | ChromaDB | Embeddings for job matching and memory |
| Relational | Supabase | Phase 2+ (user data, billing, analytics) |
| Cache | Redis (optional) | Deduplication, rate limiting |

### 2.4 UI Layer

| Phase | Interface | Technology |
|-------|-----------|------------|
| MVP | CLI | Node.js/Python script |
| Phase 2 | Portfolio chat | React + HF inference API |
| Phase 3 | Full dashboard | Figma-designed React, Supabase backend |

### 2.5 Monetization Layer

| Stream | Method | Timeline |
|--------|--------|----------|
| Immediate | Manual Upwork QA/automation proposals tonight | Day 0 |
| Week 1 | AI-generated proposals via AgentForge pipeline | Day 7 |
| Month 1 | Automation delivery + client retainer | Week 4 |
| Month 3 | Packaged SaaS tiers | Q3 2026 |
| Ongoing | Defense simulation contractor outreach (SD area) | Parallel track |

---

## 3. FAILURE POINTS

Every agent must read this section before writing code.

| Failure Mode | Root Cause | Mitigation |
|-------------|------------|------------|
| VRAM overflow mid-task | Loading models without checking headroom | VRAM watchdog before every model.load() call |
| Duplicate OwlWatcher events | Multiple listeners on same event source | Singleton event bus, one listener per event type |
| Token explosion in long sessions | Loading entire repo context repeatedly | Selective module loading, summary caches, never scan full repo twice per session |
| Hardcoded API keys | Copy-paste from tutorial | All secrets in .env, loaded via config module, enforced in linting |
| Hardcoded values anywhere | Shortcuts under deadline pressure | Config-driven from day one. PR reviewer must reject any hardcoded string/number |
| Polling loops blocking agent | Async not awaited correctly | OwlWatcher enforces event-driven pattern. Polling is a merge-blocking violation |
| Model name drift | Using ChatGPT-invented model names | Every model reference must link to its actual HF Hub page in comments |
| Hunyuan3D deployed for EU client | Developer unaware of license restriction | All 3D pipelines default to SPAR3D. Hunyuan3D usage requires explicit geographic check |
| Self-approving PRs | Speed pressure | Sign-off protocol enforced by GitHub branch protection rules |
| Feature creep (Marcus-specific risk) | GrizzwaldHouse history | PRD defines phase gates. Agents reject out-of-scope features unless a new phase is opened |

---

## 4. SIMPLIFIED ARCHITECTURE

Three pipelines only. Everything else is Phase 2 or later.

```
PIPELINE 1: FIND MONEY
Job Board Events → OwlWatcher → Job Ingestion Agent → Matching Agent → Proposal Generator → Output Formatter → Application

PIPELINE 2: SHOW CAPABILITY  
Portfolio Visitor → Chat Interface → Qwen3-VL reads context → Qwen3 drafts response → Kokoro speaks it → Logs interaction

PIPELINE 3: EARN RESIDUAL
Working pipeline → Package as config-driven SaaS → Stripe billing → Deliver via Cloudflare Worker → Support via Slack webhook
```

No pipeline depends on another for MVP. Each can ship independently.

---

## 5. MINIMUM VIABLE SYSTEM (MVS)

The MVS is the smallest version that generates revenue. Every feature outside this list is Phase 2.

### MVS Components

**Job Ingestion (A1)**
- Reads job listings from Upwork RSS and LinkedIn API (or Playwright scrape as fallback)
- Emits JOB_DISCOVERED events
- Deduplicates by job ID
- Stores in local JSON

**Job Matching (A2)**
- Scores jobs against Marcus's capability profile (defined in config, not hardcoded)
- Filters by minimum score threshold (configurable)
- Emits JOB_MATCHED events

**Proposal Generator (A3)**
- Receives JOB_MATCHED event
- Loads Marcus's master proposal template (markdown file, config-driven)
- Calls Qwen3-Coder-30B locally to customize proposal
- Falls back to HF Inference Provider if local VRAM is occupied
- Emits PROPOSAL_GENERATED event

**Output Formatter (A4)**
- Receives PROPOSAL_GENERATED event
- Formats for target platform (Upwork vs LinkedIn vs email)
- Writes to /output/proposals/{date}/{job_id}.md
- Emits APPLICATION_READY event

**Token Optimizer (A5)**
- Monitors token usage per session
- Switches from large model to smaller model when budget threshold is reached
- Logs all model switches

That is the complete MVS. Five agents, one pipeline, revenue-capable in 7 days.

---

## 6. FULL AGENT REGISTRY

| Agent ID | Role | Phase | Status |
|---------|------|-------|--------|
| A1 | Job Ingestion Agent | MVS | PENDING |
| A2 | Job Matching Agent | MVS | PENDING |
| A3 | Proposal Generator | MVS | PENDING |
| A4 | Output Formatter | MVS | PENDING |
| A5 | Token Optimizer | MVS | PENDING |
| A6 | Skill Loader | Phase 2 | PLANNED |
| A7 | Event Router | Phase 2 | PLANNED |
| A8 | QA Validator | Phase 2 | PLANNED |
| A9 | Deployment Agent | Phase 2 | PLANNED |
| A10 | UI Agent | Phase 2 | PLANNED |
| A11 | Portfolio Chat Agent | Phase 2 | PLANNED |
| A12 | 3D Asset Pipeline Agent | Phase 3 | PLANNED |
| A13 | Voice Interface Agent | Phase 3 | PLANNED |
| A14 | Veteran Grant Scout Agent | Phase 2 | PLANNED |
| A15 | SaaS Packaging Agent | Phase 3 | PLANNED |

---

## 7. SIGN-OFF PROTOCOL

This protocol is enforced by branch protection rules. No exceptions.

```
1. Agent session begins → Claims Agent ID in README task table
2. Writes code → Opens PR with label: NEEDS-REVIEW
3. Supervisor session reviews:
   - No hardcoded values
   - No polling loops
   - Tests written
   - Code uses most advanced approach available (no minimal/lazy code)
   - All models referenced by real HF Hub URL in comments
4. Supervisor approves → Adds label: SUPERVISOR-APPROVED
5. Agent updates README task table:
   - Marks task DONE
   - Records completion timestamp
   - Records model/session used
6. Merge allowed
```

README task table format:

```markdown
| Task ID | Agent ID | Description | Status | Completed By | Timestamp |
|---------|----------|-------------|--------|--------------|-----------|
| T001 | A1 | Job Ingestion scaffold | DONE | claude-code-session-01 | 2026-05-03 |
```

---

## 8. CODE QUALITY NON-NEGOTIABLES

Every agent session must enforce these. Supervisor rejects PRs that violate them.

1. **No hardcoded values.** Every string, number, URL, threshold, model name, and path lives in a config file or environment variable.
2. **No polling loops.** All triggers are event-driven via OwlWatcher.
3. **No minimal/lazy code under time pressure.** If a task needs a proper abstraction layer, build it. AgentForge runs for years.
4. **Observer/broadcaster pattern.** Agents communicate through events, not direct function calls.
5. **Modular and independently testable.** Each agent must run in isolation with mocked events.
6. **Config-driven model selection.** The model an agent uses is read from config, never hardcoded in business logic.
7. **VRAM check before every model load.** No exceptions.
8. **All secrets in .env.** Loaded through a config module. Direct `process.env` access only in the config module.
9. **Scalable by design.** Every decision must answer: "Will this still work with 100 clients and 50 agents?"
10. **No EM dashes in code comments or documentation.** They are a clear AI-generation signal.

---

## 9. MONOREPO STRUCTURE

```
/AgentForge
  /apps
    /job-agent           # Pipeline 1: Find Money
    /portfolio-chat      # Pipeline 2: Show Capability
    /saas-packager       # Pipeline 3: Earn Residual
  /core
    /agentic-os          # State machine, agent registry
    /owl-watcher         # Event bus, trigger system
    /vram-watchdog       # VRAM monitor, slot manager
    /config              # All configuration loaded here
    /inference           # Model loading, routing, fallback logic
  /agents
    /a1-job-ingestion
    /a2-job-matching
    /a3-proposal-gen
    /a4-output-formatter
    /a5-token-optimizer
    /_template           # Copy this to create a new agent
  /skills                # Reusable skill markdowns (submodule)
  /workflows             # Workflow definition files
  /events                # Event schema definitions
  /config
    /models.config.json  # All model names, VRAM budgets, fallback chains
    /agents.config.json  # Agent registry, capabilities, slot assignments
    /jobs.config.json    # Job board sources, scoring weights
    /revenue.config.json # Pricing tiers, billing config
  /prompts               # Reusable prompt templates
  /output                # Agent output (gitignored except schema)
  /docs
    /PRD.md              # This document
    /SKILLS.md           # Skill definitions and reuse guide
    /WORKFLOWS.md        # Workflow documentation
  /tests
  PRD.md                 # Symlink to /docs/PRD.md
  README.md              # Task table lives here
```

---

## 10. 7-DAY BUILD PLAN

### Day 1 (Tonight)
- Apply to at least one QA or automation contract on Upwork manually (revenue before code)
- Initialize monorepo with the structure above
- Define event contracts (JOB_DISCOVERED, JOB_MATCHED, PROPOSAL_GENERATED, APPLICATION_READY)
- Scaffold OwlWatcher event bus

### Day 2
- A1: Job Ingestion Agent (Upwork RSS source first, Playwright fallback)
- A5: Token Optimizer scaffold (blocking on model routing)

### Day 3
- A2: Job Matching Agent with Marcus capability profile in config
- Models config file complete with all VRAM budgets and fallback chains

### Day 4
- A3: Proposal Generator integrated with Qwen3-Coder-30B local + HF fallback
- Marcus master proposal template written (this is a Marcus task, not an agent task)

### Day 5
- A4: Output Formatter for Upwork and email formats
- Full pipeline test: simulated JOB_DISCOVERED to APPLICATION_READY

### Day 6
- Live job board data through the full pipeline
- First real proposal output reviewed by Marcus
- README task table complete for all MVS agents

### Day 7
- Submit first AI-generated proposals to real jobs
- Validate end-to-end without manual intervention
- Document what broke and what the Phase 2 priority order is

---

## 11. VETERAN OPPORTUNITY MAP

Agents building the portfolio chat and grant scout components must target these specifically.

### Defense Simulation (San Diego / Camp Pendleton Area)
- General Atomics: UAV systems simulation, weapons integration
- Cubic Defense: Combat training systems, simulation environments
- Anduril Industries: AI-driven autonomous systems
- Shield AI: Autonomous vehicle software
- Booz Allen Hamilton: DoD AI/ML contracting

Marcus's pitch: "8 years MK-48 torpedo systems, 3 years shipyard safety-critical process supervision, plus full-stack AI development with production HF model integration."

### Grant and Funding Targets
- SBA Veteran SBIR/STTR programs (Phase I: $305K, Phase II: $2M)
- DOD SBIR with simulation/AI angle
- Hiring Our Heroes fellowship programs
- Bunker Labs Venture programs for veteran entrepreneurs
- VET TEC 2.0 (watch June 2026 reauthorization)

### Immediate Deadline
- **July 2026:** Document employment income for military childcare assistance. This is a hard deadline. A14 (Veteran Grant Scout) must surface documentation checklist by Week 2.

### Revenue-Adjacent Opportunities
- QA Engineer contracts (Insomniac mentor referral path)
- Tools Engineer contracts (same referral path)
- Game studio contract work using UE5 + C++ portfolio (IslandEscape project)
- AI automation consulting for small businesses and agencies
- Resume/LinkedIn optimization for veterans as a done-for-you service (ironic but lucrative)

---

## 12. SERVICE PACKAGES

| Tier | Price | Deliverable |
|------|-------|-------------|
| Starter | $150 | Automation setup for one workflow |
| Pro | $500 | Custom AI agent build for one use case |
| Premium | $1,500+ | Full AgentForge deployment for client |
| Retainer | $800/mo | Maintain and extend running system |
| SaaS (future) | $29-99/mo | Self-serve access to packaged pipelines |

---

## 13. HUGGING FACE INTEGRATION PLAN

### Confirmed Model Stack (Verified Against HF Hub)

All models below are verified. Agents must add the HF Hub URL as a comment anywhere the model name appears in code.

| Model | License | Task | HF URL |
|-------|---------|------|--------|
| Qwen/Qwen3-Coder-30B-A3B-Instruct | Apache-2.0 | Local coding/reasoning | huggingface.co/Qwen/Qwen3... |
| Qwen/Qwen3-VL-7B-Instruct | Apache-2.0 | Vision, OCR, screenshots | huggingface.co/Qwen/... |
| black-forest-labs/FLUX.1-schnell | Apache-2.0 | Image generation | huggingface.co/black-forest-labs/... |
| stabilityai/stable-point-aware-3d | MIT | 3D generation (client safe) | huggingface.co/stabilityai/... |
| hexgrad/Kokoro-82M | Apache-2.0 | TTS | huggingface.co/hexgrad/... |
| openai/whisper-large-v3-turbo | MIT | ASR | huggingface.co/openai/... |
| myshell-ai/OpenVoice | MIT | Voice cloning | huggingface.co/myshell-ai/... |

**Models NOT to use (incorrect ChatGPT claims):**
- "GPT-OSS-20B" (does not exist)
- "LLaMA 3.6 CherryTorch 27B" (does not exist)

### HF Platform Services

- **Inference Providers API:** OpenAI-compatible endpoint. Base URL: `https://api-inference.huggingface.co/v1`. Auth via HF token in .env.
- **MCP Server:** Plugs into Claude Code for Hub search and Gradio Space calls.
- **ZeroGPU Spaces:** Public demo hosting. PRO tier ($9/mo) for private Spaces.

---

## 14. PHASE GATES

Feature creep is the primary risk for this project based on GrizzwaldHouse history. Phase gates are enforced by the Supervisor session. No agent may open work on Phase 2 components while any Phase 1 (MVS) task is incomplete.

### Phase 1 (MVS, Week 1)
- A1 through A5 operational
- First real proposal submitted via pipeline
- README task table current

### Phase 2 (Revenue Acceleration, Weeks 2-4)
- A6-A10 deployed
- Portfolio chat live
- LinkedIn profile updated with AgentForge demo
- First paying client or active contract

### Phase 3 (Scale and Residual, Month 2+)
- Voice interface operational
- 3D asset pipeline for game dev clients
- SaaS tier packaging
- Defense contractor outreach campaign active

---

## 15. WHAT TO IGNORE (RIGHT NOW)

- 3D pipelines (Phase 3)
- Voice interface (Phase 3)
- Full Figma-designed UI (Phase 2)
- Supabase migration (Phase 2)
- Multi-tenant SaaS infra (Phase 3)
- TRELLIS and Hunyuan3D (Phase 3, and Hunyuan3D has geographic restrictions)
- Any new GrizzwaldHouse feature requests (AgentForge first)

---

## 16. NEXT ACTIONS (ORDERED)

1. Apply to one Upwork contract tonight (QA or automation)
2. Check July childcare income documentation deadline and create paper trail
3. Initialize monorepo with the structure in Section 9
4. Drop this PRD as /docs/AGENTFORGE_PRD_v2.md
5. Run Claude Code with the onboarding prompt in /prompts/CLAUDE_CODE_ONBOARDING.md
6. Build A1 first, validate events emit correctly before building A2

---

*End of PRD v2.0*
