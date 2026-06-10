# Next Session
**Version:** 2.0
**Generated:** 2026-06-10
**For:** Any session resuming this work (Claude Code, ChatGPT, or AgentForge)

---

## Immediate Actions (Before Anything Else)

1. Verify Phase 0 recovery at `C:/Users/daley/Recovery/2026-06-10_02-23/MANIFEST.txt`
   Expected: 73 files (22 logs, 44 sessions, 5 summaries, active_session.json, HabitStreaks.json)

2. Check if Unreal Engine was closed cleanly after Phase 0.
   If yes: active_session.json (10F2D4204710955D9E1CE8BFE495DFE6) will appear in Sessions/ with a real EndTime.
   If it crashed: check next-startup log for `LogProductivitySession: Recovered session 10F2D4...`

3. Commit the AgentForge working tree (126 modified files on feat/pdf-session-1-weasyprint).
   This V2 audit package is part of that working tree.

---

## Highest-Priority Tasks (Ordered)

### 1. Unblock A5 (30-60 min)

```
a. Verify C:/Users/daley/Resumes/ has at least one .docx file
b. Run: node agents/A5-auto-apply/setup-vmock-auth.mjs
c. Add HF_BEARER_TOKEN=hf_... to agentforge_autonomous/.env
d. Inspect VMock DOM live; replace vmockSelectors in apps/job-agent/config/settings.json
e. Run: npx vitest run src/agents/resume-pipeline/  (must show 16/16)
```

### 2. Fix agentEventBus Type Cast (1 hour)

File: `src/core/events/agent-event-bus.ts`
Problem: `(agentEventBus as unknown as {...}).emit(event)` bypasses type safety.
Fix: Define typed `emit` method on the bus interface; remove double cast.

### 3. Fix C4458 and BaseCharacter Casts in WizardJam (2-3 hours)

File: `Source/END2507/AIC_QuidditchController.cpp`
- Line 651: rename local `Pawn` variable to avoid class member shadowing
- Locate `Cast<ABaseCharacter>(GetPawn())` call sites; add null check or type guard

### 4. Verify C1/C2/C3 From Architecture PDF (2 hours)

Files to read:
- `Source/END2507/AC_BroomComponent.cpp` -- verify C1 (SetFlightEnabled early-return)
- `Source/END2507/BTService_FindStagingZone.cpp` -- verify C2 (threshold logic)
- `Source/END2507/AIC_QuidditchController.cpp` lines 1-100 -- verify C3 (perception config)

Update WIZARDJAM_AUDIT_PLAN.md with VERIFIED/REFUTED status per claim.

### 5. Implement SSM Extraction (4-8 hours, separate session)

Design is in SSM_TRAINING_ARCHITECTURE.md.
Start with SnapshotCollapser (pure data transformation, no dependencies).
Privacy filter must be implemented and reviewed by Marcus before output is ingested.

---

## Do Not Do

- Do not run Fable until SSM_DATASET.jsonl exists (no data to correlate)
- Do not start Apple Cloud ingestion before the privacy gate is implemented
- Do not commit secrets (.env values) to git
- Do not generate more documentation -- this package is complete; the bottleneck is now execution
- Do not re-derive evidence: all paths and schemas are confirmed in this package

---

## Handoff Context (Do Not Re-Derive)

| Fact | Value |
|---|---|
| DPT output path | Saved/ProductivityTracker/ (NOT Saved/DeveloperProductivityTracker/) |
| Session schema field | ActivitySnapshots (NOT Events or StateTransitions) |
| Polling interval | 30 seconds |
| EActivityState::Away value | 2 |
| Crash recovery | Working -- FOnSessionRecovered confirmed in WizardJam2.0.log |
| Build error | C4458 at AIC_QuidditchController.cpp:651 |
| Runtime error | "Failed to cast pawn to BaseCharacter" (11 instances in last PIE session) |
| Phase 0 status | COMPLETE -- 73 files at Recovery/2026-06-10_02-23/ |
| AgentForge branch | feat/pdf-session-1-weasyprint (126 modified/untracked files) |
| Test baseline | 16/16 resume-pipeline tests |
| V2 package location | audit/WizardJam_Audit_V2/WizardJam_ProductivityTracker_Audit_Package_v2/ |
