# AgentForge System Unification — Research Report & Sprint Plan

**Date:** April 6, 2026
**Author:** Research Team (3 parallel agents + lead synthesis)
**For:** Marcus Daley

---

## EXECUTIVE SUMMARY

Marcus, here's the honest picture: You have **30 GitHub repos**, at least **8 substantial local projects**, and **zero shipped products**. The pattern is clear — new idea → build skeleton → get distracted → new idea. Your research document nails it: *"stop starting, start finishing."*

**The good news:** You have genuinely strong building blocks scattered across these repos. BrightForge has a working LLM client + plan engine. Agent-Alexander has a production-grade extraction pipeline with Drizzle ORM, Playwright, and encryption. The portfolio website is 30 pages on Next.js 15. Fraud-Guard-Sentinel has a real ML pipeline. These aren't throwaway code — they're proof you CAN build.

**The hard truth:** Unifying everything into one mega-system in 15 days is the exact same "shiny object" pattern that got you here. Instead, this plan identifies **ONE shippable product** and a realistic path to job applications.

---

## 1. REPOSITORY ANALYSIS

### Tier 1: KEEP & SHIP (Active, valuable, near-complete)

| Repo | Tech | Completion | Verdict |
|------|------|-----------|---------|
| **portfolio-website** | Next.js 15, React 19, TS, Tailwind 4, Three.js | ~70% | **SHIP THIS FIRST** — 30 pages, Full Sail branded, Netlify-ready. This is your #1 hiring asset. |
| **Agent-Alexander / HoneyBadgerVault** | React 18, Express 5, Drizzle ORM, SQLite, Playwright, Tauri | ~60% | **SHIP AS PORTFOLIO PIECE** — real extraction pipeline, encryption, AI search. Demonstrates full-stack + security skills. |
| **BrightForge** | Node.js, ESM, Ollama, Electron, web dashboard | ~55% | **EXTRACT reusable modules** — LLM client, plan engine, diff applier, skill orchestrator are all solid. The rest is scope creep (3D gen, design engine). |

### Tier 2: EXTRACT COMPONENTS (Useful parts, don't ship as-is)

| Repo | Reusable Components | Action |
|------|-------------------|--------|
| **SeniorDevBuddy/agentforge_autonomous** | Agent interfaces, orchestrator pattern, dashboard UI (Next.js 15 + Framer Motion) | Extract agent interfaces + dashboard as portfolio demo |
| **Bob-AICompanion** | LLM fallback chain, Discord webhooks, GitHub Actions automation | Extract LLM client pattern into BrightForge |
| **Fraud-Guard-Sentinel** | ML scoring pipeline, rule engine, audit logging, dashboard | Keep as standalone portfolio piece |
| **cowork-skills** | Skill definitions, task templates | Reference library, already useful |

### Tier 3: ARCHIVE (School projects, duplicates, dead code)

| Repo | Reason |
|------|--------|
| WizardJam (v1) | Superseded by WizardJam 2.0 |
| Portfolio (old C++) | Superseded by portfolio-website |
| GrizzwaldHouse.github.io | Dead, use portfolio-website instead |
| MarcusDaley_SPAGHETTI_RELAY | School assignment |
| Flocking-Lab, B---Path-Planner | School assignments |
| 2DBLIT, StoneHedge, 3dWorldSpace | School graphics projects |
| Doggo, PathPlanner | School assignments |
| grizz_ultimate_system | Legacy, superseded by grizz_modular_system |

### Tier 4: GAME DEV (Keep separate, work on AFTER getting hired)

| Repo | Status | Action |
|------|--------|--------|
| **DeepCommand** | Private, C++ naval game | Park until employed. Great portfolio piece when ready. |
| **WizardJam 2.0** | Active UE5 project | Park until employed. |
| **IslandEscape** | Capstone project | Already submitted for graduation. Archive. |
| **StructuredLogging** | UE5 plugin, shipped | Keep as-is. Good portfolio piece. |
| **DeveloperProductivityTracker** | UE5 plugin, shipped | Keep as-is. Good portfolio piece. |
| **UnrealProjects/Plugins** | Plugin workspace | Keep for future UE5 work. |

---

## 2. REDUNDANCY MAP

### Duplicate Agents (found across 4 repos)

| Agent Role | SeniorDevBuddy | BrightForge | Agent-Alexander | Verdict |
|-----------|---------------|-------------|-----------------|---------|
| Planner | PlannerAgent (stub) | MasterAgent + classifyTask | — | Use BrightForge's real implementation |
| Builder | BuilderAgent (stub) | LocalAgent + CloudAgent | — | Use BrightForge's real implementation |
| Reviewer | ReviewerAgent (stub) | — | — | New, build fresh |
| Tester | TesterAgent (stub) | — | vitest suite | Build fresh, reference Alexander's test patterns |
| Learning | LearningAgent (stub) | — | AI search module | Extract Alexander's AI module |
| Context | ContextManagerAgent (stub) | FileContext.scan() | — | Use BrightForge's FileContext |
| LLM Client | ModelService (stub) | UniversalLLMClient (working!) | Ollama integration | **Use BrightForge's — it's the most complete** |
| Orchestrator | AgentOrchestrator (Promise.all) | Supervisor + EventBus | — | Use BrightForge's supervisor pattern |

**Key insight:** BrightForge has the most working code for agent orchestration. SeniorDevBuddy's agents are all stubs. The AgentForge dashboard UI is the only valuable piece from SeniorDevBuddy.

### Duplicate UI Patterns

| Pattern | Portfolio | AgentForge | Alexander | Fraud-Guard |
|---------|----------|-----------|-----------|-------------|
| Dashboard layout | — | Next.js 15 + Framer | React 18 + Vite | React + Vite |
| Component library | Radix + shadcn | Radix + Tailwind 4 | Radix + shadcn | Shadcn + Recharts |
| Charts | Recharts | — | — | Recharts |

All 4 projects use React + Radix/shadcn. Standardize on Next.js 15 (portfolio stack).

### Duplicate Infrastructure

| Feature | Bob-AICompanion | BrightForge | AgentForge |
|---------|---------------|-------------|-----------|
| LLM fallback chain | YAML-configured, 8 providers | JS, Ollama + cloud | TypeScript, ModelService stub |
| Discord webhooks | Working | — | — |
| GitHub Actions | Working (6 AM PST) | — | Placeholder CI |

---

## 3. UNIFIED ARCHITECTURE PLAN

### The ONE System: AgentForge + BrightForge Core

```
AgentForge Unified System
├── core/                        # From BrightForge (working code)
│   ├── llm-client/              # UniversalLLMClient (Ollama + cloud fallback)
│   ├── plan-engine/             # Plan generation + diff application
│   ├── file-context/            # Project file scanning
│   ├── skill-orchestrator/      # Skill execution
│   └── event-bus/               # Agent communication
│
├── agents/                      # Unified agent roster
│   ├── PlannerAgent             # From BrightForge MasterAgent
│   ├── BuilderAgent             # From BrightForge LocalAgent/CloudAgent
│   ├── ReviewerAgent            # New (code review via LLM)
│   ├── TesterAgent              # New (test runner + coverage)
│   ├── LearningAgent            # From Alexander AI modules
│   └── ContextManagerAgent      # From BrightForge FileContext
│
├── integrations/
│   ├── huggingface/             # HF Hub + Inference API
│   ├── ollama/                  # Local model management
│   ├── discord/                 # From Bob-AICompanion
│   └── github-actions/          # From Bob-AICompanion
│
├── vault/                       # From Agent-Alexander
│   ├── extraction/              # Document extraction pipeline
│   ├── indexing/                # ChromaDB vector indexing
│   ├── search/                  # Semantic search
│   └── knowledge-graph/         # Knowledge visualization
│
├── job-system/                  # NEW
│   ├── scraper/                 # Job board extraction
│   ├── resume-generator/        # Tailored resume generation
│   ├── cover-letter/            # Cover letter generation
│   ├── tracker/                 # Application tracking DB
│   └── follow-up/               # Automated follow-up emails
│
├── dashboard/                   # From AgentForge (Next.js 15)
│   ├── agent-monitor/           # Real-time agent activity
│   ├── task-tracker/            # Task/job progress
│   ├── narrative-panel/         # Human-readable execution logs
│   └── flow-visualization/      # Agent graph + animation
│
└── config/
    ├── providers.yaml           # LLM provider chain
    ├── agents.yaml              # Agent definitions
    └── schedule.yaml            # Automation schedule
```

---

## 4. HUGGING FACE INTEGRATION PLAN

### What You Have Now
- HF MCP server is already configured in Claude Code
- Available tools: `space_search`, `hub_repo_search`, `paper_search`, `hf_doc_search`, `dynamic_space`
- Your `oldskol65` HF account is authenticated

### What You're Missing

**A. Model Selection Engine**
Your research doc identifies the right models but you haven't built the selection layer:

```
Local (Ollama) — use when:          Remote (HF Inference) — use when:
├── Privacy required                ├── Need specific model not local
├── No internet                     ├── GPU-heavy task (3D gen, image gen)
├── Fast iteration                  ├── ZeroGPU free tier available
└── Code generation (qwen2.5-coder) └── Specialized fine-tuned model
```

**Recommended model roster:**

| Task | Local (Ollama) | Remote (HF) | License |
|------|---------------|-------------|---------|
| Code generation | qwen2.5-coder:14b | Qwen3-Coder | Apache 2.0 |
| Planning | deepseek-r1:8b | — | MIT |
| Code review | qwen3:8b | — | Apache 2.0 |
| Routing/classification | mistral:7b | distilbert-base-uncased | Apache 2.0 |
| Embeddings (Vault) | nomic-embed-text | sentence-transformers/all-MiniLM-L6-v2 | Apache 2.0 |
| Image generation | — | FLUX.1-schnell | Apache 2.0 |
| 3D assets | — | TripoSR / SF3D | MIT |
| NPC dialogue | — | facebook/bart-large-mnli | MIT |

**B. HF Spaces for Portfolio**
Deploy a Gradio demo on HF Spaces showing your AgentForge system in action. Free tier gives 2 CPU cores, 16GB RAM. ZeroGPU gives free H200 GPU time for demos. This becomes a **live portfolio piece** that hiring managers can interact with.

**C. HF Evaluate for Benchmarking**
Use the `evaluate` library to benchmark your local Ollama models against HF models. This data goes into your portfolio as proof of engineering rigor.

**D. HF Datasets for Vault Training**
Use the `datasets` library to load training data for fine-tuning your local models on your extracted school documents. The Alexander Vault becomes both a knowledge base AND a training pipeline.

### Integration Code Pattern

```javascript
// Model abstraction layer
class ModelRouter {
  async route(task) {
    if (task.requiresGPU) return this.hfInference(task);
    if (task.requiresPrivacy) return this.ollama(task);
    if (this.ollamaAvailable()) return this.ollama(task);
    return this.hfInference(task);
  }
}
```

---

## 5. ALEXANDER VAULT KNOWLEDGE SYSTEM

### Current State
Agent-Alexander has a working extraction pipeline:
- Playwright CDP for browser automation
- Canvas/Moodle/Blackboard API connectors
- AES-256-GCM encryption
- Drizzle ORM + SQLite storage
- AI-powered semantic search (basic)

### What to Add for AgentForge Integration

```
Vault Enhancement Pipeline:
1. INGEST: Extract documents from school LMS (already built)
2. CHUNK: Split documents into semantic chunks (new)
3. EMBED: Generate embeddings via nomic-embed-text (new)
4. INDEX: Store in ChromaDB vector database (new)
5. RETRIEVE: Semantic search for agent context injection (upgrade existing)
6. LEARN: Track what was useful, improve retrieval (new)
```

This turns your school documents into a knowledge base that agents can query. When the PlannerAgent needs to solve a problem, it searches the Vault for relevant patterns from your coursework.

---

## 6. AGENT SYSTEM DESIGN

### Unified Agent Interface

```typescript
interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  model: ModelConfig;  // which LLM to use
  execute(input: AgentInput): Promise<AgentOutput>;
  onEvent(event: AgentEvent): void;
}

interface AgentInput {
  taskId: string;
  context: Record<string, unknown>;
  vaultContext?: VaultSearchResult[];  // injected from Vault
}

interface AgentOutput {
  success: boolean;
  data?: unknown;
  logs: string[];
  artifacts?: string[];  // files created/modified
}

type AgentRole = 'planner' | 'builder' | 'reviewer' | 'tester' | 'learner' | 'context';
```

### Communication Pattern

```
EventBus (from BrightForge)
  ├── task.created → PlannerAgent
  ├── plan.generated → BuilderAgent
  ├── code.generated → ReviewerAgent
  ├── review.passed → TesterAgent
  ├── test.passed → LearningAgent (observe)
  ├── test.failed → BuilderAgent (retry)
  └── task.completed → ContextManagerAgent (archive)
```

### Task Lifecycle
```
PENDING → IN_PROGRESS → REVIEW → TESTING → DONE
                ↓           ↓         ↓
             BLOCKED    REJECTED   FAILED → IN_PROGRESS (retry)
```

---

## 7. JOB APPLICATION SYSTEM

### Architecture

```
Job System
├── Scrapers
│   ├── Indeed (MCP tools available in Claude Code)
│   ├── LinkedIn (MCP tools available)
│   ├── Hitmarker.net (game industry)
│   ├── Work With Indies
│   ├── RemoteGameJobs.com
│   └── GameJobs.co
│
├── Resume Engine
│   ├── Base resume (your experience)
│   ├── Tailoring agent (matches keywords from job posting)
│   ├── Cover letter generator
│   └── Portfolio link selector (which projects to highlight)
│
├── Tracker (SQLite)
│   ├── Applications table
│   ├── Follow-ups table (7-day, 14-day reminders)
│   ├── Responses table
│   └── Analytics (applications/week, response rate)
│
└── Automation
    ├── Daily job scan (GitHub Actions, 6 AM PST)
    ├── Discord notification of new matches
    ├── Weekly progress report
    └── Follow-up email reminders
```

### Target: 7+ Applications/Week

Your research doc says 7 isn't enough for game dev. Agreed. Target structure:
- **Game dev roles**: 5/week (UE5, C++, tools programming)
- **Web dev roles**: 3/week (React, Node.js, TypeScript — your proven stack)
- **AI/ML roles**: 2/week (your agent systems demonstrate this)
- **Total**: 10/week target, 7 minimum

### Resume Variants (pre-built)
1. **Game Developer** — emphasizes UE5, C++, DeepCommand, WizardJam, graphics
2. **Full-Stack Developer** — emphasizes React, Node.js, TypeScript, portfolio
3. **AI/ML Engineer** — emphasizes agent systems, LLM integration, BrightForge
4. **Tools Programmer** — emphasizes StructuredLogging, DeveloperProductivityTracker, BrightForge

---

## 8. REALISTIC 15-DAY SPRINT PLAN

**Constraint:** 10-15 hours/week = ~2-3 hours/day max.

### Phase 1: Ship the Portfolio (Days 1-4)

**Day 1 (2-3 hrs):**
- [ ] Audit portfolio-website build (`npm run build` — must show 30/30 pages)
- [ ] Fix any build errors
- [ ] Deploy to Netlify (not Vercel — fix the CLAUDE.md that says Vercel)
- [ ] Ensure all project pages have content

**Day 2 (2-3 hrs):**
- [ ] Add BrightForge as a portfolio project page
- [ ] Add Fraud-Guard-Sentinel as a portfolio project page
- [ ] Add Agent-Alexander (HoneyBadgerVault) as a portfolio project page
- [ ] Verify responsive design on mobile

**Day 3 (2-3 hrs):**
- [ ] Add StructuredLogging UE5 plugin as portfolio piece
- [ ] Add DeveloperProductivityTracker as portfolio piece
- [ ] Write "About" page content (Navy veteran, Full Sail grad, game dev)
- [ ] Add resume download link

**Day 4 (2-3 hrs):**
- [ ] Final polish pass (animations, load times, accessibility)
- [ ] Set up analytics (basic page views)
- [ ] Deploy final build to Netlify
- [ ] PORTFOLIO IS SHIPPED

### Phase 2: Job System MVP (Days 5-8)

**Day 5 (2-3 hrs):**
- [ ] Create job-system module in AgentForge
- [ ] Set up SQLite database for application tracking
- [ ] Build Indeed job search integration (using available MCP tools)

**Day 6 (2-3 hrs):**
- [ ] Build resume tailoring agent (takes job description → outputs tailored resume)
- [ ] Create 4 resume variants (game dev, full-stack, AI/ML, tools)
- [ ] Build cover letter generator

**Day 7 (2-3 hrs):**
- [ ] Build application tracker UI (simple Next.js page)
- [ ] Add Discord notifications for new job matches
- [ ] Set up GitHub Actions daily job scan

**Day 8 (2-3 hrs):**
- [ ] Submit first 7 job applications using the system
- [ ] Add follow-up reminder system
- [ ] JOB SYSTEM MVP IS SHIPPED

### Phase 3: Agent System Unification (Days 9-11)

**Day 9 (2-3 hrs):**
- [ ] Extract BrightForge's UniversalLLMClient into AgentForge core
- [ ] Extract BrightForge's EventBus into AgentForge core
- [ ] Wire up Ollama model router

**Day 10 (2-3 hrs):**
- [ ] Implement PlannerAgent (real, using BrightForge patterns)
- [ ] Implement BuilderAgent (real, using BrightForge patterns)
- [ ] Wire agents to EventBus

**Day 11 (2-3 hrs):**
- [ ] Implement ReviewerAgent
- [ ] Add HuggingFace model router (local vs remote selection)
- [ ] Test full agent pipeline: plan → build → review

### Phase 4: Vault + HF Integration (Days 12-13)

**Day 12 (2-3 hrs):**
- [ ] Set up ChromaDB for vector storage
- [ ] Build document chunking pipeline
- [ ] Generate embeddings for existing Vault documents

**Day 13 (2-3 hrs):**
- [ ] Wire Vault search into agent context injection
- [ ] Deploy Gradio demo on HF Spaces (free tier)
- [ ] Add HF model benchmarking data to portfolio

### Phase 5: Polish + Deploy (Days 14-15)

**Day 14 (2-3 hrs):**
- [ ] Run all tests across all modules
- [ ] Fix any broken builds
- [ ] Archive Tier 3 repos (move to /archive or make private)
- [ ] Update all CLAUDE.md files

**Day 15 (2-3 hrs):**
- [ ] Final deployment of AgentForge dashboard
- [ ] Update portfolio with live demo links
- [ ] Submit 7 more job applications
- [ ] Write sprint retrospective in LEARNING.md

---

## 9. IMMEDIATE NEXT ACTIONS (Day 1 — Do These NOW)

1. **Run `npm run build` in `D:\portfolio-website`** — see if it builds clean
2. **Deploy portfolio to Netlify** — get your hiring URL live TODAY
3. **Create 4 resume PDFs** — game dev, full-stack, AI/ML, tools programmer
4. **Apply to 3 jobs** — don't wait for the system, start manually today
5. **Archive dead repos** — go to GitHub Settings on each Tier 3 repo, click Archive

### The Anti-Shiny-Object Rule

Before starting ANY new feature or project, you must answer:
1. Is my portfolio deployed? If no → work on portfolio.
2. Have I applied to 7+ jobs this week? If no → apply to jobs.
3. Is there an in-progress task? If yes → finish it first.

**The system that matters most is the one that's SHIPPED.**

---

## 10. REPO MERGE STRATEGY SUMMARY

| Action | Repos | Result |
|--------|-------|--------|
| **SHIP** | portfolio-website | Live portfolio at your domain |
| **SHIP** | Agent-Alexander | Portfolio piece + knowledge vault |
| **MERGE INTO AGENTFORGE** | BrightForge core modules | LLM client, plan engine, event bus |
| **MERGE INTO AGENTFORGE** | Bob-AICompanion patterns | Discord hooks, GitHub Actions, LLM chain |
| **KEEP SEPARATE** | Fraud-Guard-Sentinel | Standalone portfolio piece |
| **KEEP SEPARATE** | StructuredLogging, DevProductivityTracker | UE5 portfolio pieces |
| **KEEP SEPARATE** | cowork-skills | Skill reference library |
| **KEEP SEPARATE** | DeepCommand, WizardJam 2.0 | Game dev (post-employment) |
| **ARCHIVE** | 12+ school/dead repos | Clean up GitHub profile |

---

## CLOSING THOUGHT

Marcus, you have the skills. You've built LLM clients, extraction pipelines, UE5 plugins, fraud detection systems, full-stack dashboards, and agent orchestrators. The problem isn't ability — it's completion.

The single most important thing you can do tomorrow morning is deploy your portfolio website and apply to 3 jobs. Everything else — the unified agent system, the HF integration, the knowledge vault — is secondary to getting hired. Build those systems AFTER you have income.

Ship. Apply. Ship. Apply. That's the loop.
