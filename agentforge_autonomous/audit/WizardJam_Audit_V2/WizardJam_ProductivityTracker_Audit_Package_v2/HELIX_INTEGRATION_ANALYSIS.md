# Helix Integration Analysis
**Version:** 2.0
**Generated:** 2026-06-10

---

## What Helix Is

Helix is the evaluation rubric used by Fable (Claude's long-context model) to assess
structured datasets for training readiness. In this project, it is used to validate
SSM_DATASET.jsonl before any model training occurs.

Fable's strength is cross-document correlation: given multiple long documents, it can
assess whether claims in one document are supported by evidence in others.

---

## Where Fable Fits in This Project

### Use: SSM Dataset Validation

**Input documents (all simultaneously):**
1. SSM_DATASET.jsonl (the extracted sequences)
2. WIZARDJAM_AUDIT_PLAN.md (expected sequence types and golden patterns)
3. TELEMETRY_RECOVERY_AUDIT.md (known data characteristics)
4. SSM_TRAINING_ARCHITECTURE.md (design intent)

**Fable task:** Evaluate whether SSM_DATASET.jsonl:
- Contains the golden sequence types (compile-error-fix, PIE iteration, crash recovery)
- Has correct labels (EActivityState values match described behaviors)
- Has adequate edge-case coverage (not all Away blocks)
- Is internally consistent (timestamps sequential, durations match delta)

**Output:** Commercial Readiness Score (0-100%) with per-dimension breakdown

### Use: Commercial Readiness Assessment

**Input documents:**
1. EXECUTIVE_SUMMARY.md
2. ROADMAP.md
3. WIZARDJAM_AUDIT_PLAN.md (C1/C2/C3 status)
4. AGENT_TEAM_ARCHITECTURE.md (Phase 2 gap list)
5. Any Unreal Marketplace submission requirements (external)

**Fable task:** Correlate audit findings against marketplace requirements.
Identify gaps between current state and submission-ready state.

---

## Helix Rubric (Applied to SSM_DATASET.jsonl)

| Dimension | What it checks | Passing threshold |
|---|---|---|
| Sequence coherence | Each sequence has a logical start, middle, end | >90% of sequences |
| Completeness | All golden sequence types represented | All 4 golden sequences present |
| Label correctness | State values match described behaviors | Zero contradictions |
| Edge-case coverage | Dataset contains non-dominant patterns | >5% non-Away sequences |
| Timestamp integrity | Monotonically increasing within sessions | 100% (hard requirement) |
| Privacy compliance | No MachineId, no raw app names in output | 100% (hard requirement) |

**Minimum passing score:** 10/18 (same threshold as log quality scoring)

---

## Prerequisites (Do Not Run Fable Until All Pass)

| Prerequisite | Status |
|---|---|
| SSM_DATASET.jsonl exists | NOT YET (extraction not run) |
| SSM_DATASET.jsonl passes privacy filter | NOT YET |
| SSM_DATASET.jsonl reviewed by Marcus | NOT YET |
| Fable model available (claude-fable-5) | AVAILABLE (per environment config) |
| Input documents prepared | PARTIAL (WIZARDJAM_AUDIT_PLAN.md done; marketplace reqs not gathered) |

**Current status: BLOCKED.** Fable cannot run until SSM_DATASET.jsonl exists.

---

## Fable vs. Other Models

| Model | Best use in this project |
|---|---|
| Fable 5 | Long-horizon correlation across 5+ large documents; SSM validation; marketplace gap analysis |
| Sonnet 4.6 | Code generation, audit report writing (this session) |
| Haiku 4.5 | Fast extraction tasks, log parsing, JSON transformation |
| Ollama (local) | SSM inference after training; privacy-preserving analysis of session data |

Do not use Fable for tasks that fit in a single context window.
Use it only when correlation across multiple large documents is required.

---

## Recommended Fable Prompt Template (For Future Session)

```
You are validating a training dataset against its design specification.

Documents provided:
1. SSM_DATASET.jsonl -- the dataset to validate
2. SSM_TRAINING_ARCHITECTURE.md -- design intent (golden sequences, field spec)
3. TELEMETRY_RECOVERY_AUDIT.md -- known data characteristics
4. WIZARDJAM_AUDIT_PLAN.md -- expected event types from source and logs

Apply the Helix rubric:
- Sequence coherence (score /3)
- Completeness (score /3)
- Label correctness (score /3)
- Edge-case coverage (score /3)
- Timestamp integrity (PASS/FAIL)
- Privacy compliance (PASS/FAIL)

Output:
- Per-dimension score and evidence
- Total score /18
- PASS (>=10) or FAIL (<10)
- If FAIL: specific gaps and remediation steps
- Do not fabricate evidence. If a golden sequence type is absent, score it 0.
```
