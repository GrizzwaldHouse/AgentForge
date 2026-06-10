# V2 Package Plan
**Generated:** 2026-06-09 (Claude Code local disk pass -- supersedes v1 version)
**Status:** APPROVED TO GENERATE -- evidence at ~90% coverage

---

## Evidence Coverage Change From V1

The v1 plan estimated 60% coverage with 40% stubs. Local disk search found all
high-priority evidence. Coverage is now ~90%. The V2 package can be substantially
complete without any additional uploads.

---

## V2 Folder Structure

```
WizardJam_ProductivityTracker_Audit_Package_v2/
├── START_HERE.md                          [GENERATE_NOW]
├── EXECUTIVE_SUMMARY.md                   [GENERATE_NOW -- evidence-complete]
├── SOURCE_REGISTRY.md                     [GENERATE_NOW]
├── EVIDENCE_INVENTORY.md                  [GENERATE_NOW -- from Step 1, complete]
├── MISSING_EVIDENCE_REPORT.md             [GENERATE_NOW -- from Step 5, complete]
├── SAFE_SHUTDOWN_REQUIREMENTS.md          [GENERATE_NOW -- from Step 3, complete]
├── PACKAGE_AUDIT.md                       [GENERATE_NOW]
├── TELEMETRY_EXISTENCE_REPORT.md          [GENERATE_NOW -- from Step 2, complete]
├── TELEMETRY_RECOVERY_AUDIT.md            [GENERATE_NOW -- 51 sessions available]
├── WIZARDJAM_AUDIT_PLAN.md                [GENERATE_NOW -- 249 source files + 15 logs]
├── PRODUCTIVITY_TRACKER_AUDIT.md          [GENERATE_NOW -- source + runtime data]
├── PRIVACY_AND_COMPLIANCE_AUDIT.md        [GENERATE_NOW -- PRIVACY.md + SECURITY.md present]
├── SSM_TRAINING_ARCHITECTURE.md           [GENERATE_NOW -- session structure confirmed]
├── AGENT_TEAM_ARCHITECTURE.md             [GENERATE_NOW -- research reports present]
├── HELIX_INTEGRATION_ANALYSIS.md          [GENERATE_NOW -- rubric present]
├── APPLE_CLOUD_RECOVERY_AUDIT.md          [STUB -- requires iCloud download]
├── ROADMAP.md                             [GENERATE_NOW -- evidence-complete]
├── RISKS_AND_GAPS.md                      [GENERATE_NOW]
├── NEXT_SESSION.md                        [GENERATE_NOW]
└── handoffs/
    ├── AGENTFORGE_HANDOFF.md              [GENERATE_NOW -- full context]
    ├── CLAUDE_CODE_HANDOFF.md             [GENERATE_NOW]
    ├── CHATGPT_HANDOFF.md                 [GENERATE_NOW]
    └── CODEX_HANDOFF.md                   [GENERATE_NOW]
```

---

## Generation Rules

**GENERATE_NOW:** Fully written, no placeholder prose, grounded in confirmed artifacts.
Where a section must acknowledge a gap, it names the exact missing input explicitly.

**STUB:** File exists with PENDING_EVIDENCE header, names exact required input,
provides template that fills when data arrives. Never lorem ipsum or [TBD].

---

## Key Upgrades From V1 Plan

| File | V1 Plan Status | V2 Plan Status | Reason |
|---|---|---|---|
| TELEMETRY_RECOVERY_AUDIT.md | STUB | GENERATE_NOW | 51 session files found |
| WIZARDJAM_AUDIT_PLAN.md | GENERATE_NOW (from PDF) | GENERATE_NOW + source | 249 source files found |
| PRODUCTIVITY_TRACKER_AUDIT.md | GENERATE_NOW (source only) | GENERATE_NOW + runtime | Sessions + summaries found |
| SAFE_SHUTDOWN_REQUIREMENTS.md | UNKNOWN | GENERATE_NOW | Assessment complete |
| REPOSITORY_RECOVERY_REPORT.md | Partial | COMPLETE | All repos found |

---

## Files That Improve Materially With Additional Evidence

| File | Current state | Improvement if Apple Cloud collected |
|---|---|---|
| APPLE_CLOUD_RECOVERY_AUDIT.md | STUB | Becomes full media catalog + duplicate analysis |
| SSM_TRAINING_ARCHITECTURE.md | ~90% complete | Adds media/video session data pipeline |
| AGENT_TEAM_ARCHITECTURE.md | ~90% complete | Adds time-series media ingestion path |

---

## Estimated V2 Quality

| Evidence state | Estimated completeness |
|---|---|
| Current state (all local evidence found) | 90% real, 10% stubs |
| After Apple Cloud download | 97% real, 3% stubs |

---

## Generation Sequence (Recommended)

Phase 1 -- Foundation (no dependency on log/session reads):
1. START_HERE.md
2. EVIDENCE_INVENTORY.md (copy from reports/, update header)
3. MISSING_EVIDENCE_REPORT.md (copy from reports/, update header)
4. SOURCE_REGISTRY.md
5. PACKAGE_AUDIT.md

Phase 2 -- Telemetry (requires session JSON reads):
6. TELEMETRY_EXISTENCE_REPORT.md (copy from reports/)
7. TELEMETRY_RECOVERY_AUDIT.md (analyze 51 session files)
8. PRODUCTIVITY_TRACKER_AUDIT.md (merge source audit + runtime findings)

Phase 3 -- WizardJam (requires source + log reads):
9. WIZARDJAM_AUDIT_PLAN.md (source search + log quality score)
10. SAFE_SHUTDOWN_REQUIREMENTS.md (copy from reports/)
11. PRIVACY_AND_COMPLIANCE_AUDIT.md

Phase 4 -- Architecture and Strategy:
12. SSM_TRAINING_ARCHITECTURE.md
13. AGENT_TEAM_ARCHITECTURE.md
14. HELIX_INTEGRATION_ANALYSIS.md
15. RISKS_AND_GAPS.md
16. ROADMAP.md
17. EXECUTIVE_SUMMARY.md (written last -- synthesizes all above)
18. NEXT_SESSION.md

Phase 5 -- Handoffs and Stub:
19. handoffs/AGENTFORGE_HANDOFF.md
20. handoffs/CLAUDE_CODE_HANDOFF.md
21. handoffs/CHATGPT_HANDOFF.md
22. handoffs/CODEX_HANDOFF.md
23. APPLE_CLOUD_RECOVERY_AUDIT.md (STUB with template)

---

## Approval Gate

Per the Audit Package Validation Rule, this plan must be reviewed before V2 is written.
Marcus approves by responding "generate V2" or by explicitly naming which phases to run.
