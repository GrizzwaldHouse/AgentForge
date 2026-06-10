# SSM Training Architecture
**Version:** 2.0
**Generated:** 2026-06-10 (updated from v1 with confirmed schema and field names)
**Status:** READY FOR EXTRACTION after privacy filter approval

---

## Purpose

This document defines how WizardJam + DPT telemetry becomes SSM (State Space Model)
training data for AgentForge's local inference pipeline.

Full chain:
```
WizardJam UE sessions (ActivitySnapshots)
  + UE logs (compile events, PIE events, runtime errors)
    -> Event extraction + snapshot collapse
        -> Privacy filter
            -> SSM_DATASET.jsonl
                -> Fable validation (Helix rubric)
                    -> Local model training (Ollama)
```

---

## Confirmed Data Schema (v2 correction)

**v1 used the wrong field names.** The session JSON does not have `Events` or
`StateTransitions`. The correct top-level field is `ActivitySnapshots`.

### ActivitySnapshot (confirmed from 3436039747ACA50408593E9B5857A7E0.json)

| Field | Type | SSM use |
|---|---|---|
| Timestamp | ISO 8601 UTC | Sequence anchor |
| State | int (EActivityState) | Primary label |
| SecondsSinceLastInput | float | Idle duration signal |
| bEditorFocused | bool | Context flag |
| bPlayInEditorActive | bool | PIE event boundary |
| bExternalAppFocused | bool | Context flag |
| FocusedExternalApp | string | REDACT before ingestion |
| bSourceFilesModified | bool | Code change event |
| ProductivityWeight | float | Derived score |
| SnapshotChecksum | MD5 | STRIP before ingestion |

### EActivityState Values (confirmed)

| Value | State | Observed |
|---|---|---|
| 1 | Active | Not in sampled data (0 ActiveSeconds across all sessions) |
| 2 | Away | Dominant state (>99% of sampled session time) |
| 3 | Thinking | Present (9-47 seconds per session) |
| 4 | Paused | Not observed |

---

## Snapshot Collapse (Required Preprocessing)

The polling interval is 30 seconds. Consecutive snapshots with identical State values
represent one continuous activity block, not discrete events. Collapse before training:

```
Input: 881 snapshots (e.g., all State=2 for 8.75 hours)
Output: 1 activity block { state: 2, start: T0, end: T880, duration_seconds: 31782 }
```

Algorithm:
```
blocks = []
current = snapshots[0]
for snap in snapshots[1:]:
    if snap.State == current.State and not snap.bPlayInEditorActive != current.bPlayInEditorActive:
        extend current block
    else:
        close current block, append to blocks
        current = new block from snap
close final block
```

Split on `bPlayInEditorActive` changes even within the same State, because PIE
start/stop is a meaningful event boundary regardless of activity state.

---

## Target Event Types

| Event type | Source | Detection method |
|---|---|---|
| CompileStart | build_*.log | File creation timestamp + UBT header line |
| CompileError | build_*.log | `error C\d+:` pattern |
| CompileFix | ActivitySnapshot | bSourceFilesModified = true after CompileError |
| CompileSuccess | build_*.log | `Total execution time:` without preceding error |
| PIEStart | ActivitySnapshot | bPlayInEditorActive transitions false -> true |
| PIEStop | ActivitySnapshot | bPlayInEditorActive transitions true -> false |
| CastFailure | WizardJam2.0.log | `LogTemp: Error: Failed to cast pawn to BaseCharacter` |
| DelegateBindSuccess | WizardJam2.0.log | `LogTemp: Death delegate bound for` |
| SessionRecovered | WizardJam2.0.log | `LogProductivitySession: Recovered session` |
| AwayBlock | ActivitySnapshot collapsed | State=2 block, duration > threshold |
| ThinkingBlock | ActivitySnapshot collapsed | State=3 block |

---

## Golden Sequences (Highest Training Value)

### Sequence 1: Compile-Error-Fix Cycle (confirmed possible from build logs)
```
CompileStart
  -> CompileError (C4458 at AIC_QuidditchController.cpp:651)
    -> [developer edits source] (bSourceFilesModified = true in next snapshot)
      -> CompileStart
        -> CompileSuccess
```
Concrete instance: build_20260607.log shows C4458 error. build_20260607b.log and
build_20260607c.log represent the subsequent fix attempts.

### Sequence 2: PIE Iteration Cycle
```
PIEStart (bPlayInEditorActive: false -> true)
  -> CastFailure events (LogTemp: Error: Failed to cast pawn)
    -> PIEStop (bPlayInEditorActive: true -> false)
      -> [gap]
        -> PIEStart
```
Confirmed: 5 cast failures at frame 662, PIE restart, 5 more at frame 104.

### Sequence 3: Crash Recovery
```
UE crash (unclean shutdown)
  -> Next startup: SessionRecovered log entry
    -> Session finalized with duration + Active: 0.0%
      -> New session started
```
Confirmed: session E8A1E3D74C recovered on 2026-06-09 startup.

### Sequence 4: Away Block (dominant pattern)
```
EActivityState::Away (duration > 1800s)
  -> [no PIE, no source modification]
    -> EActivityState::Away continues
```
The most common pattern in the dataset. Useful for learning idle-state duration
distributions and distinguishing from productive sessions.

---

## Extraction Pipeline

```
Sessions/*.json + WizardJam2.0.log + build_*.log
  -> SnapshotCollapser
       (collapse consecutive same-State snapshots into activity blocks)
       (split on bPlayInEditorActive transitions)
  -> LogEventExtractor
       (parse UE log for compile events, PIE events, cast failures, delegate bindings)
       (join with ActivitySnapshot timeline by timestamp)
  -> SequenceBuilder
       (sliding window of 10 activity blocks or events)
       (group related events into labeled sequences)
  -> PrivacyFilter
       (strip: MachineId, SnapshotChecksum, RecordChecksum)
       (redact: FocusedExternalApp -> [APP_NAME_REDACTED])
       (replace: SecondsByApplication keys -> [APP_N])
  -> SSM_DATASET.jsonl
       (one JSON object per sequence)
       (schema: { sequence_id, events[], duration_ms, outcome, session_id_hash })
  -> Fable validation
       (Helix rubric: coherence, completeness, label correctness, edge-case coverage)
  -> Training-ready dataset
```

---

## Readiness Gate

| Gate | Status |
|---|---|
| Phase 0 complete | PASS (2026-06-10 02:23) |
| Sessions available | PASS (51 files) |
| Summaries available | PASS (5 files) |
| Log available | PASS (WizardJam2.0.log, quality: GOOD) |
| Schema confirmed | PASS (ActivitySnapshots, 30s polling) |
| Privacy filter reviewed | PENDING -- Marcus must approve before ingestion |
| SSM_DATASET.jsonl schema reviewed | PENDING -- schema above is design, not approved |

**Extraction does not run until all gates pass.**

---

## Where Fable Fits

Fable is NOT used for raw log extraction (that is the pipeline above).
Fable IS used for long-horizon correlation AFTER the dataset exists:

```
README claims
  + SSM_DATASET.jsonl
    + Marketplace requirements
      + Architecture docs
        + Roadmap
          = Commercial Readiness Score
```

Do not run Fable until `SSM_DATASET.jsonl` exists and passes the Helix rubric.
See HELIX_INTEGRATION_ANALYSIS.md for the rubric details.
