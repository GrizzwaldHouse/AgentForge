# Roadmap
**Version:** 2.0
**Generated:** 2026-06-10
**Evidence basis:** Local disk findings + ChatGPT audit docs (2026-05-09)

---

## Current State

| System | State | Evidence |
|---|---|---|
| AgentForge A1-A4 pipeline | ACTIVE | Phase 1 complete (D1-D10 per ChatGPT audit) |
| AgentForge A5 resume pipeline | ACTIVE (blocked) | VMock selectors are placeholders |
| WizardJam 2.0 | ACTIVE development | 249 source files, build logs, active PIE sessions |
| DPT plugin | ACTIVE | 51 sessions, crash recovery confirmed working |
| SSM pipeline | DESIGNED | Extraction not implemented |
| Apple Cloud recovery | NOT STARTED | iCloud not downloaded |

---

## Phase 1: Immediate (This Week)

**Goal:** Unblock A5 and commit checkpoint.

| Task | File/location | Effort |
|---|---|---|
| Replace VMock selectors | apps/job-agent/config/settings.json | 1-2 hours (requires live DOM inspection) |
| Run VMock auth setup | agents/A5-auto-apply/setup-vmock-auth.mjs | 30 min |
| Verify resume vault | C:/Users/daley/Resumes/ | 15 min |
| Add HF_BEARER_TOKEN | agentforge_autonomous/.env | 15 min |
| Checkpoint commit (126 modified files) | feat/pdf-session-1-weasyprint | 30 min |
| Fix R1: agentEventBus type cast | src/core/events/agent-event-bus.ts | 1 hour |

**Outcome:** A5 pipeline runs end-to-end; agentEventBus is type-safe.

---

## Phase 2: Short-Term (Next 2 Weeks)

**Goal:** Implement SSM extraction and address highest-severity WizardJam issues.

| Task | Evidence | Effort |
|---|---|---|
| Fix R2: BaseCharacter cast failures | AIC_QuidditchController.cpp cast sites | 2-4 hours |
| Fix C4458 at AIC_QuidditchController.cpp:651 | build_20260607.log | 30 min |
| Implement SnapshotCollapser | SSM_TRAINING_ARCHITECTURE.md design | 4-8 hours |
| Implement LogEventExtractor | SSM_TRAINING_ARCHITECTURE.md design | 4-8 hours |
| Run extraction on 51 sessions | Sessions/*.json + WizardJam2.0.log | 1 hour |
| Privacy filter implementation | PRIVACY_AND_COMPLIANCE_AUDIT.md spec | 2-4 hours |
| Marcus reviews SSM_DATASET.jsonl schema | SSM_TRAINING_ARCHITECTURE.md | 30 min |
| Fix R4: SSE close race | SSE route handler | 2 hours |
| Verify C1/C2/C3 against source | AC_BroomComponent.cpp, BTService_FindStagingZone.cpp | 2-4 hours |

**Outcome:** SSM_DATASET.jsonl exists; WizardJam critical bugs fixed; SSE is stable.

---

## Phase 3: Medium-Term (1 Month)

**Goal:** Fable validation, live scraping, domain partitioning.

| Task | Prerequisite | Effort |
|---|---|---|
| Run Fable validation on SSM_DATASET.jsonl | Phase 2 extraction complete | 1-2 hours |
| Fix Fable-identified gaps | Fable output | varies |
| Activate Himalayas/RemoteOK scrapers | Phase 2 A5 unblocked | 1-2 weeks |
| Implement HoneyBadgerVault | Design doc | 1 week |
| Extract prompts to config/prompts/ (R2) | -- | 2-4 hours |
| Update DomainRegistry.ts (game-dev domain) | -- | 2-4 hours |
| Apple Cloud download + privacy filter | iCloud for Windows | 2-4 hours |
| AgentForge memory ingestion of Apple Cloud facts | Apple Cloud downloaded | 1-2 days |

**Outcome:** SSM training data validated; live scraping active; game-dev domain online.

---

## Phase 4: Long-Term (Q3 2026)

**Goal:** Local model training, marketplace submission readiness.

| Task | Prerequisite |
|---|---|
| Ollama fine-tuning on SSM_DATASET.jsonl | Fable validation passed |
| Commercial Readiness Score via Fable | Marketplace requirements gathered |
| WizardJam Marketplace submission prep | C1/C2/C3 fixed; assets polished |
| Postgres migration (>50 apps/day trigger) | Sustained application volume |
| Redis (multi-process trigger) | Scale beyond single process |
| Gmail ingestion (A6) | Phase 3 complete |

---

## Revenue Alignment

| Milestone | Revenue impact | Timeline |
|---|---|---|
| A5 unblocked (this week) | Applications can submit; resume scored | Immediate |
| Phase 2 SSM extraction | No direct revenue; infrastructure | 2 weeks |
| Phase 3 live scraping | More jobs found; higher application volume | 1 month |
| Q1 2026 target: $1K/month | Requires consistent daily application flow | Ongoing |
| Q2 2026 target: $2-3K/month | Requires portfolio + client work | Q2 |

The critical path to revenue is A5 (resume pipeline unblocked) before SSM (infrastructure).
SSM is a long-horizon investment, not a Q1 deliverable.
