# Learning Log

> Knowledge base for the Grizz Modular System. Patterns, errors, fixes, and insights extracted from execution cycles.

---

## Categories

| Tag | Meaning |
|-----|---------|
| [PATTERN] | Reusable approach confirmed across multiple uses |
| [ERROR] | Mistake or failure to learn from |
| [FIX] | Solution that resolved an issue |
| [OPTIMIZATION] | Improvement to speed, cost, or quality |
| [ARCHITECTURE] | Structural decision with long-term impact |

---

## Baseline Patterns (Extracted 2026-04-05)

### [ARCHITECTURE] Multi-Provider LLM Fallback Chain
- **Source:** Bob-AICompanion (src/core/llm-client.js)
- **Pattern:** Chain free providers (Groq → Cerebras → Together → Mistral) before paid (Claude → OpenAI)
- **Why it works:** Keeps daily cost at $0-5/month while maintaining reliability
- **Reuse:** Any project needing LLM calls should follow this chain
- **Key detail:** Each provider has different rate limits and model availability — the client handles transparent fallback

### [ARCHITECTURE] Source Adapter Pattern
- **Source:** Bob-AICompanion (src/job-intelligence/source-adapters/)
- **Pattern:** Each data source gets its own adapter module with a common interface (fetch, parse, normalize)
- **Why it works:** Adding a new job board = adding one file, no changes to pipeline logic
- **Reuse:** Any data ingestion from multiple external sources

### [ARCHITECTURE] Component-Based Actor Design (UE5)
- **Source:** WizardJam 2.0 (Source/END2507/Utilities/)
- **Pattern:** Split actor behavior into AC_ components (Health, Stamina, SpellCollection, Broom)
- **Why it works:** Components are reusable across different actor types; single-responsibility
- **Key rule:** Components communicate via delegates, never direct references to sibling components
- **Reuse:** Any UE5 actor with multiple behaviors

### [ARCHITECTURE] Delegate/Observer for Decoupling (UE5)
- **Source:** WizardJam 2.0 (CLAUDE.md AAA standards)
- **Pattern:** Broadcaster defines delegate, listeners bind to it. Never poll for state changes.
- **Why it works:** Eliminates tight coupling, actors don't need to know about each other
- **Anti-pattern:** GameplayStatics::GetAllActorsOfClass — use delegates instead

### [ARCHITECTURE] Interface Contracts for Loose Coupling (UE5)
- **Source:** WizardJam 2.0 (Source/END2507/Interfaces/)
- **Pattern:** Define IPickupInterface, IInteractable etc. Actors implement interfaces, callers check via Cast or Implements
- **Why it works:** Any actor can be interactable without inheriting from a specific base class
- **Reuse:** Any system where multiple unrelated actor types need common behavior

### [PATTERN] Memory Persistence via GitHub Artifacts
- **Source:** Bob-AICompanion (.github/workflows/morning-brief.yml)
- **Pattern:** Save JSON state as GitHub Artifact at end of workflow, download at start of next run
- **Why it works:** Free persistence for serverless GitHub Actions without a database
- **Limitation:** 90-day retention on artifacts, must handle missing state gracefully

### [PATTERN] YAML for Configuration, JSON for State
- **Source:** Bob-AICompanion (config/)
- **Pattern:** Human-edited config in YAML (readable, comments allowed), machine state in JSON
- **Why it works:** Clear separation — humans edit YAML, code reads/writes JSON
- **Reuse:** Any Node.js project with both configuration and runtime state

### [PATTERN] Skill Deduplication Before Creation
- **Source:** ClaudeSkills system + this initialization
- **Pattern:** Before creating a new skill, check: (1) ClaudeSkills/skills/, (2) ClaudeSkills/Example_Skills/, (3) SKILLS.md registry, (4) project codebase
- **Why it works:** Prevents skill bloat and duplicated effort
- **Reuse:** Every skill generation cycle

### [PATTERN] Task Templates for Consistency
- **Source:** C:\ClaudeSkills\tasks\
- **Pattern:** Standardized checklists for common workflows (feature implementation, bug fix, UI upgrade, game feature, etc.)
- **Why it works:** Ensures nothing is missed, new tasks start from proven checklists
- **Reuse:** Every task creation — pick the right template from TT-001/002/003

### [OPTIMIZATION] Free-Tier First LLM Strategy
- **Source:** Bob-AICompanion config/llm-providers.yaml
- **Lesson:** Groq and Cerebras free tiers handle 80%+ of daily LLM needs
- **Cost impact:** $0-5/month instead of $30-50/month
- **Caveat:** Free tiers have rate limits — build retry/fallback logic

### [OPTIMIZATION] ES Modules Only
- **Source:** Marcus's coding standards
- **Lesson:** All Node.js code uses `import/export`, never `require()`
- **Why:** Cleaner tree-shaking, future-proof, consistent with browser modules
- **Enforcement:** "type": "module" in package.json, .js extension

---

### [ARCHITECTURE] EventBus with SSE Push (Zero-Polling)
- **Source:** Agent-Alexander (server/extraction/event-bus.ts)
- **Pattern:** Unified EventEmitter with multiple channels (extraction, analysis, ai). Frontend subscribes via SSE endpoint. Selective React Query cache invalidation on each event.
- **Why it works:** Eliminates all polling timers. Real-time updates with zero wasted requests. Scales to hundreds of concurrent events.
- **Anti-pattern:** setInterval polling, setTimeout retry loops
- **Reuse:** Any project needing real-time UI updates (skill execution progress, chat streaming, database changes)

### [ARCHITECTURE] Connector Interface (Plugin Architecture)
- **Source:** Agent-Alexander (server/extraction/base-connector.ts)
- **Pattern:** Common interface (login, getCourses, getDocuments, downloadFile) with platform-specific implementations. ExtractionManager picks connector based on config.
- **Why it works:** Adding a new data source = adding one file. No changes to orchestration logic.
- **Already have:** SK-014 Source Adapter Pattern from Bob-AICompanion (same concept, different domain)
- **Reuse:** LLM providers, document parsers, database adapters, any pluggable external service

### [ARCHITECTURE] Consent-Gated AI Processing
- **Source:** Agent-Alexander (server/ai/ai-orchestrator.ts)
- **Pattern:** Check `privacy.ai_enabled` setting before any AI operation. Try Ollama local first, cloud fallback only if needed. All calls logged to audit_logs.
- **Why it works:** Users control when AI is used. Transparent audit trail. API keys never exposed to client.
- **Key detail:** Every AI endpoint calls requireAIConsent() first — no exceptions
- **Reuse:** Any project with optional AI features, privacy-sensitive data processing

### [PATTERN] Retry with Exponential Backoff
- **Source:** Agent-Alexander (server/extraction/retry-handler.ts)
- **Pattern:** `withRetry<T>(operation, name, jobId, config)` wraps any async operation. Backoff: base^attempt (1s, 4s, 16s). Retryable: 408, 429, 500-504. Logged to both DB and SSE.
- **Why it works:** Handles transient failures gracefully. Dual logging means debugging is easy.
- **Reuse:** API calls, database operations, network requests with transient failures

### [PATTERN] Circuit Breaker
- **Source:** Agent-Alexander (server/extraction/extraction-manager.ts)
- **Pattern:** Count consecutive failures. After threshold (3), abort entire operation. Prevents cascading failures, IP bans, rate limit exhaustion.
- **Reuse:** Any batch operation hitting external APIs (job pipeline, web scraping, bulk LLM calls)

### [PATTERN] Metadata-Only AI Enrichment
- **Source:** Agent-Alexander (server/ai)
- **Pattern:** Never send raw document content to AI. Only send metadata (title, filename, MIME type, existing tags). AI suggests tags/summaries from metadata alone.
- **Why it works:** Privacy guaranteed. Actual content stays local. Metadata is safe to process externally.
- **Reuse:** Any AI feature processing user content where privacy matters

### [OPTIMIZATION] Lazy Imports for Heavy Dependencies
- **Source:** Agent-Alexander (server/workflow-engine.ts)
- **Pattern:** AI libraries (flashcard generator, OCR, verification) imported only when needed via dynamic `import()`.
- **Why it works:** Faster server startup. Optional features don't load unless used. Reduces memory footprint.
- **Reuse:** Any Node.js project with large optional dependencies

### [PATTERN] Smart Collections with Rules
- **Source:** Agent-Alexander (shared/schema.ts — collectionRules table)
- **Pattern:** field + operator + value rules that auto-categorize items. Supports: tag, course, mimeType, school, dateRange, title. Rules persist and auto-apply forever.
- **Why it works:** Zero ongoing user effort. Scales to thousands of items without manual sorting.
- **Reuse:** Skill categorization, task auto-assignment, document organization

### [ARCHITECTURE] Ollama Model Benchmarking Strategy
- **Source:** ollama-audit-training skill (new, 2026-04-05)
- **Pattern:** Run 8 standard benchmark prompts across all local models (3x each for consistency). Score on 5 dimensions (accuracy, code_quality, consistency, reasoning, structure). Generate auto-routing config from results.
- **Available models:** llama3.3:70b (42GB, quality), glm-4.7-flash (19GB, balanced), llama3:8b (4.7GB, speed)
- **Key insight:** Different models win different task types — no single model is best at everything
- **Reuse:** Any multi-model LLM setup needing task-based routing

### [OPTIMIZATION] Auto Model Selection by Task
- **Source:** ollama-audit-training skill (new, 2026-04-05)
- **Pattern:** Selection algorithm considers: task_type, quality_requirement, latency_budget, cost_constraint, local_only flag. Produces optimal model per request.
- **Profiles:** ultra_fast (llama3:8b, 500ms), fast (glm-4.7-flash, 2s), balanced (llama3.3:70b, 5s), quality (llama3.3:70b, 15s), max_quality (70B or Claude, 60s)
- **Integrates with:** Bob-AICompanion's UniversalLLMClient via chatSmart() method

---

## Error Log

| Date | Category | Description | Resolution | Lesson |
|------|----------|-------------|------------|--------|
| _No errors yet_ | — | — | — | — |

---

## Session Notes

### 2026-04-05: System Initialization
- Scanned 5 active projects across 3 drives
- Detected 24 reusable skills initially (3 production, 5 reference, 14 project-derived, 2 utility)
- Integrated C:\ClaudeSkills with 3 production skills, 5 example skills, 3 task template sets
- Bob-AICompanion has the richest reusable pattern library (7 skills extracted)
- WizardJam 2.0 has mature UE5 patterns (5 skills extracted)
- Portfolio Website is early-stage but has modern stack (1 skill)

### 2026-04-05: Ollama Audit & Training Skill Created
- Built 5-part skill: Core Audit, Benchmarking, Auto-Selection, Optimization, Dashboard
- Detected 3 local Ollama models: llama3.3:70b, glm-4.7-flash, llama3:8b
- Created 8 benchmark prompts matching Bob-AICompanion's task_routing types
- Defined 5 optimization profiles (ultra_fast → max_quality)
- Skill stored at C:\ClaudeSkills\skills\ollama-audit-training\

### 2026-04-05: Agent-Alexander Integration
- Scanned D:\Agent-Alexander (Honey Badger Vault — document extraction system)
- Extracted 15 reusable patterns (EventBus, Connector Interface, Retry Handler, etc.)
- Key architectural discovery: Zero-polling SSE architecture for real-time updates
- Privacy patterns: consent-gated AI, metadata-only enrichment, AES-256-GCM encryption
- Tech stack: React 18 + TypeScript + Express 5 + SQLite/Drizzle + Ollama + Tauri
- Total skills now: 44 (up from 24)

---

## Statistics

- **Total Entries:** 21 patterns + 3 session notes
- **Errors Logged:** 0
- **Last Updated:** 2026-04-05
