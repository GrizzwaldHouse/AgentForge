# Risks and Gaps
**Version:** 2.0
**Generated:** 2026-06-10

---

## Risk Register

### R1: AIC_QuidditchController Pawn Shadowing (CONFIRMED -- HIGH)

**Evidence:** build_20260607.log, AIC_QuidditchController.cpp line 651
**Error:** `error C4458: declaration of 'Pawn' hides class member`
**Risk:** Local variable `Pawn` shadows `AController::Pawn`. If the intent is to
modify the controller's reference to its controlled pawn, this silently operates on
the wrong variable. Behavior may be correct but fragile.
**Fix:** Rename local variable to `ControlledPawn` or `TargetPawn`.
**Blocking:** No (build succeeded on subsequent attempt per build_20260607b.log)

---

### R2: BaseCharacter Cast Failures at Runtime (CONFIRMED -- HIGH)

**Evidence:** WizardJam2.0.log, 11 instances across 2 PIE sessions
**Error:** `LogTemp: Error: Failed to cast pawn to BaseCharacter`
**Risk:** At least one actor in the level is a pawn but not a BaseCharacter subclass.
Any code path that casts GetPawn() to BaseCharacter without null-checking the result
will either crash (if it dereferences null) or silently skip logic (if it returns early).
The 5-per-session pattern suggests this is a recurring per-PIE-init failure, not a one-off.
**Fix:** Add `IsA<ABaseCharacter>()` check before cast, or ensure all pawn actors in
the level are BaseCharacter subclasses.
**Blocking:** No (PIE continues; delegate binding succeeds for the 3 QuidditchAgents)

---

### R3: ExternalActivityMonitor Not Active (CONFIRMED -- MEDIUM)

**Evidence:** SecondsByApplication: {} in all sampled session summaries
**Risk:** Application-level tracking is the highest-signal dimension for understanding
developer workflow. Without it, the SSM dataset lacks the "which tool was being used"
context. Compile-then-edit cycles cannot be confirmed across VS Code and UE.
**Fix:** Check ProductivityTrackerSettings for ExternalActivityMonitor enable flag.
May require Windows accessibility permissions (Settings > Privacy > Activity History).
**Impact on SSM:** FocusedExternalApp will remain empty; app-level sequences are unavailable.

---

### R4: ActiveSeconds Always Zero (CONFIRMED -- MEDIUM)

**Evidence:** AggregatedSummary.ActiveSeconds = 0 in all sampled sessions
**Risk:** The EActivityState::Active state is never reached. This means the "developer
is actively working" dimension of the SSM dataset is missing. All sessions appear as
idle-plus-thinking, which is misleading.
**Fix:** Review `ActivityThresholdSeconds` in ProductivityTrackerSettings. Also check
whether compile waits (no keyboard input during compilation) exceed the threshold.
**Impact on SSM:** No Active-state sequences. Golden Sequence 3 (deep work block) cannot
be extracted from current data.

---

### R5: AgentEventBus Type Cast (CONFIRMED FROM CHATGPT AUDIT -- HIGH)

**Evidence:** ChatGPT proposed_refactors.md, R1
**Code:** `(agentEventBus as unknown as {...}).emit(event)`
**Risk:** Double cast through `unknown` bypasses TypeScript type checking.
If the EventBus interface changes, callers fail silently at runtime instead of
at compile time. This is the highest-priority technical debt in the AgentForge codebase.
**Fix:** Define a proper typed `emit` method on the agentEventBus interface and call it directly.
**File:** src/core/events/agent-event-bus.ts

---

### R6: SSE Close Race Condition (CONFIRMED FROM CHATGPT AUDIT -- MEDIUM)

**Evidence:** ChatGPT proposed_refactors.md, R4
**Risk:** The SSE route handler may attempt to write to a closed connection if the
pipeline emits `pipeline.ingestion_complete` after the client disconnects.
**Fix:** Add `pipeline.ingestion_complete` event emission before closing the SSE stream;
check connection state before writing.
**File:** SSE route handler (path not confirmed in this session)

---

### R7: Apple Cloud Evidence Gap (CONFIRMED -- LOW for V2, MEDIUM long-term)

**Evidence:** Zero Apple Cloud files on local disk
**Risk:** Family archive, Time Capsule assets, and Apple Cloud documents are unrecovered.
If the iCloud account or device is lost before download, this data is gone.
**Fix:** Run iCloud download per APPLE_CLOUD_RECOVERY_AUDIT.md instructions.
**Blocking for V2:** No (APPLE_CLOUD_RECOVERY_AUDIT.md is the only stub).

---

### R8: Uncommitted AgentForge Working Tree (CONFIRMED -- MEDIUM)

**Evidence:** git status at session start showed 126 modified/untracked files on
branch `feat/pdf-session-1-weasyprint`
**Risk:** If the branch is lost or reset before commit, this work is gone.
**Fix:** Checkpoint commit before end of session.
**Action:** `git add <specific files> && git commit -m "checkpoint: [description]"`

---

## Gap Register

### G1: C1/C2/C3 Source Verification

**Gap:** The three architecture pitfalls from the v1 PDF (BroomComponent early-return,
StagingZone threshold, perception radius) are claimed but not verified against source.
AC_BroomComponent.cpp, BTService_FindStagingZone.cpp, and AIC_QuidditchController.cpp
(beyond line 651) have not been read in this session.
**Needed:** Read those 3 files and update WIZARDJAM_AUDIT_PLAN.md with VERIFIED/REFUTED status.

### G2: SSM Dataset Does Not Exist

**Gap:** The extraction pipeline is designed but not implemented. SSM_DATASET.jsonl
does not exist yet. Fable validation cannot run.
**Needed:** Implement SnapshotCollapser + LogEventExtractor; run against 51 sessions.

### G3: VMock Selectors Are Placeholders

**Gap:** apps/job-agent/config/settings.json vmockSelectors contain placeholder values
that will fail against the live VMock DOM.
**Needed:** Inspect VMock DOM live; replace selectors with real values.

### G4: Phase 2 AgentForge Systems Not Started

**Gap:** Live job scraping (Himalayas, RemoteOK), HoneyBadgerVault, Gmail ingestion,
pipeline dashboard are all dormant. Phase 1 is the only active pipeline.
**Trigger:** >50 applications/day sustained rate (per database_recommendations.md)

### G5: Domain Partitioning Inactive

**Gap:** Only career-intelligence domain is active. game-dev, ai-engineering,
va-medical, educational are dormant. DomainRegistry.ts has not been updated.
**Needed:** Update DomainRegistry.ts with activation criteria per domain.
