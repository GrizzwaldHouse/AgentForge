# Evidence Inventory
**Generated:** 2026-06-09 (Claude Code local disk pass)
**Method:** Direct filesystem search of C:\Users\daley\UnrealProjects\BaseGame and v1 zip extraction

---

## V1 Package Inventory

**File:** WizardJam_ProductivityTracker_Audit_Package_v1_1.zip
**Size:** 29,826 bytes
**Extracted to:** audit/WizardJam_Audit_V2/evidence/v1_package/

### V1 Package Contents (14 files -- fully written, not stubs)

| File | Size | Assessment |
|---|---|---|
| START_HERE.md | 3,342 bytes | Complete -- navigation index |
| SAFE_SHUTDOWN_PROTOCOL.md | 4,153 bytes | Complete -- Phase 0 + 7 steps |
| SESSION_CAPTURE_CHECKLIST.md | 1,405 bytes | Complete -- quick checklist |
| MISSING_EVIDENCE_REPORT.md | 4,081 bytes | Complete -- pre-disk-search findings |
| EVIDENCE_INVENTORY.md | 4,178 bytes | Complete -- upload-based inventory |
| TELEMETRY_EXISTENCE_REPORT.md | 4,044 bytes | Complete -- upload-based search |
| PRODUCTIVITY_TRACKER_AUDIT.md | 5,363 bytes | Complete -- DPT architecture audit |
| PRIVACY_AND_COMPLIANCE_AUDIT.md | 3,540 bytes | Complete -- GDPR/privacy analysis |
| SSM_TRAINING_ARCHITECTURE.md | 4,717 bytes | Complete -- SSM dataset plan |
| AGENTFORGE_AUDIT_BOOTSTRAP.md | 3,276 bytes | Complete -- phase sequence |
| APPLE_CLOUD_DEPENDENCY_REPORT.md | 3,081 bytes | Complete -- iCloud dependency |
| V2_PACKAGE_PLAN.md | 3,849 bytes | Complete -- V2 structure plan |
| NEXT_ACTIONS_AFTER_SHUTDOWN.md | 2,912 bytes | Complete -- ordered action list |
| handoffs/AGENTFORGE_HANDOFF.md | 3,115 bytes | Complete -- full context handoff |
| handoffs/CLAUDE_CODE_HANDOFF.md | 2,652 bytes | Complete -- paste-ready prompt |

**Finding:** The v1 package is NOT a skeleton of stubs. It is a fully written v1.1 package.
The original 1,845-byte skeleton was superseded before this Claude Code session began.

---

## Local Disk Evidence -- DeveloperProductivityTracker Output

**NOTE:** The plugin writes to `Saved/ProductivityTracker/` not `Saved/DeveloperProductivityTracker/`.
Both paths were searched. Output is in the shorter path.

### Sessions (51 files)

| Date range | Count | Total size |
|---|---|---|
| 2026-01-25 | ~15 files | varies |
| 2026-01-26 | ~25 files | varies |
| 2026-01-27 | ~7 files | varies |
| 2026-01-28 | ~3 files | varies |
| 2026-01-29 | 1 file | 2,768 bytes |
| 2026-06-08 | 1 file | 135,034 bytes |

Selected files by size:
- `3436039747ACA50408593E9B5857A7E0.json` -- 318,398 bytes (largest session)
- `1A6AFC1741ED6DA798FAF1A4E074CC53.json` -- 119,697 bytes
- `295110F34E2B2A0B4248EEAF5B25C8D2.json` -- 106,317 bytes
- `97654B534304BA79CC63168192E43A92.json` -- 100,095 bytes
- `E8A1E3D74C44F8CB9C417BA690528F80.json` -- 135,034 bytes (June 2026 session)

### Daily Summaries (5 files)

| File | Size | Date |
|---|---|---|
| 2026-01-25.json | 759 bytes | Jan 25 |
| 2026-01-26.json | 1,197 bytes | Jan 26 |
| 2026-01-27.json | 661 bytes | Jan 27 |
| 2026-01-28.json | 525 bytes | Jan 28 |
| 2026-01-29.json | 434 bytes | Jan 29 |

### Active Session

| File | Size | Status |
|---|---|---|
| active_session.json | 972,616 bytes | OPEN -- session started 2026-06-08T22:42:31Z, elapsed ~22.5 hours |

**Warning:** Unreal Engine or the tracker appears to be running. active_session.json is 972KB
and has an EndTime of 0001-01-01 (sentinel for "not yet closed"). Do not kill this process
without running Phase 0 from SAFE_SHUTDOWN_PROTOCOL.md first.

### Wellness Data

| File | Size | Notes |
|---|---|---|
| HabitStreaks.json | 625 bytes | 27 stretches, 7 breaks today (2026-06-09) |

---

## Local Disk Evidence -- Unreal Engine Logs

**Path:** C:\Users\daley\UnrealProjects\BaseGame\Saved\Logs\
**Count:** 15 files

| File | Size | Date |
|---|---|---|
| WizardJam2.0.log | 490,399 bytes | 2026-06-09 (most recent, today) |
| WizardJam2.0-backup-2026.06.08-05.52.05.log | 394,972 bytes | 2026-06-07 |
| WizardJam2.0-pre_attempt1.log | 394,972 bytes | 2026-06-07 (duplicate of above) |
| WizardJam2.0-backup-2026.06.08-01.58.12.log | 204,351 bytes | 2026-06-07 |
| WizardJam2.0-backup-2026.06.08-05.53.58.log | 291,821 bytes | 2026-06-07 |
| WizardJam2.0-pre_attempt2.log | 291,821 bytes | 2026-06-07 (duplicate) |
| WizardJam2.0-backup-2026.06.08-05.55.31.log | 287,074 bytes | 2026-06-07 |
| WizardJam2.0-pre_attempt3.log | 287,074 bytes | 2026-06-07 (duplicate) |
| WizardJam2.0-backup-2026.06.08-05.56.13.log | 285,481 bytes | 2026-06-07 |
| WizardJam2.0-backup-2026.06.07-23.41.13.log | 247,037 bytes | 2026-06-07 |
| build_20260607.log | 3,842 bytes | 2026-06-07 |
| build_20260607b.log | 3,348 bytes | 2026-06-07 |
| build_20260607c.log | 2,899 bytes | 2026-06-07 |
| UnrealVersionSelector-2026.01.24-22.25.09.log | 725,990 bytes | 2026-01-24 |
| UnrealVersionSelector-2026.01.28-00.19.06.log | 726,932 bytes | 2026-01-28 |

**Most valuable:** WizardJam2.0.log (490KB, today) -- primary audit target.
**build logs:** 3 files from June 7 -- may contain compile errors relevant to C1/C2/C3 pitfalls.

---

## Local Disk Evidence -- WizardJam Source

**Path:** C:\Users\daley\UnrealProjects\BaseGame\Source\END2507\
**Total files:** 249
**Breakdown:** 115 .h headers, 101 .cpp implementations, 32 no-extension, 1 .cs

This exceeds the 64-file estimate from the architecture PDF. The codebase has grown since the audit PDF was written.

---

## Local Disk Evidence -- Other

| File | Path | Size | Notes |
|---|---|---|---|
| Telemetry.json | Saved/Telemetry/ | 876,645 bytes | UE engine telemetry, updated today |
| PackageRestoreData.json | Saved/Autosaves/ | 94 bytes | UE autosave state |
| UncontrolledChangelists.json | Saved/SourceControl/ | 4,722 bytes | Source control state |
| WorldState JSONs | Saved/Config/WorldState/ | 266 bytes each | Level state snapshots |
| .fathom-server.json | Saved/Fathom/ | 213 bytes | Fathom plugin state |

---

## Summary

| Category | V1 Package Assumed | Actual Finding |
|---|---|---|
| DPT session files | MISSING | FOUND: 51 files |
| DPT daily summaries | MISSING | FOUND: 5 files |
| Active session | MISSING | FOUND: open, 972KB |
| UE log files | MISSING | FOUND: 15 files |
| WizardJam source | MISSING | FOUND: 249 files |
| V1 package quality | "8 stubs, 1,845 bytes" | Actually v1.1: 14 full files, 29KB |

**Every high-priority item listed as MISSING in the v1 MISSING_EVIDENCE_REPORT is now FOUND.**
