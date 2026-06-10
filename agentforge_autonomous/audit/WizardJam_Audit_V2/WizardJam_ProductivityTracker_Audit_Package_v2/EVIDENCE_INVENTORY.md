# Evidence Inventory
**Version:** 2.0
**Generated:** 2026-06-10 (Claude Code local disk pass)
**Method:** Direct filesystem search of C:\Users\daley\UnrealProjects\BaseGame

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
| handoffs/AGENTFORGE_HANDOFF.md | 3,115 bytes | Contains incorrect DPT path (corrected in v2) |
| handoffs/CLAUDE_CODE_HANDOFF.md | 2,652 bytes | Contains incorrect DPT path (corrected in v2) |

**Finding:** The v1 package is NOT a skeleton. It is a fully written v1.1 package.
The original 1,845-byte skeleton was superseded before this Claude Code session began.

---

## DeveloperProductivityTracker Output

**Corrected path:** `Saved/ProductivityTracker/` (NOT `Saved/DeveloperProductivityTracker/`)

The v1 package and both v1 handoff files documented the wrong path. The plugin
registers as "DeveloperProductivityTracker" in LogPluginManager but writes its
output under the short name. This caused the v1 pass to report all telemetry as MISSING.

### Sessions (51 files)

| Date | Count | Size range |
|---|---|---|
| 2026-01-25 | ~15 | varies |
| 2026-01-26 | ~25 | varies |
| 2026-01-27 | ~7 | varies |
| 2026-01-28 | ~3 | varies |
| 2026-01-29 | 1 | 2,768 bytes |
| 2026-06-07/08 | 1 | 135,034 bytes |

Selected files by size:

| SessionId | Size | Date range | Notes |
|---|---|---|---|
| 3436039747ACA50408593E9B5857A7E0 | 318,398 bytes | 2026-01-27 (8h54m) | Largest; 881 snapshots |
| E8A1E3D74C44F8CB9C417BA690528F80 | 135,034 bytes | 2026-06-07 (3h7m) | Was recovered on startup 2026-06-09 |
| 1A6AFC1741ED6DA798FAF1A4E074CC53 | 119,697 bytes | Jan 2026 | |
| 295110F34E2B2A0B4248EEAF5B25C8D2 | 106,317 bytes | Jan 2026 | |
| 97654B534304BA79CC63168192E43A92 | 100,095 bytes | Jan 2026 | |

**Session JSON schema (confirmed from 3436039747ACA50408593E9B5857A7E0):**

Top-level keys: `ActivitySnapshots`, `ActivitySummary`, `bWasRecovered`, `EndTime`,
`LinkedTaskId`, `MachineId`, `PluginVersion`, `RecordChecksum`, `SessionId`,
`StartTime`, `TotalElapsedSeconds`

ActivitySnapshot schema (30-second polling interval):
- `Timestamp` (ISO 8601 UTC)
- `State` (integer: 2 = Away, others per EActivityState enum)
- `SecondsSinceLastInput`
- `bEditorFocused` (bool)
- `bPlayInEditorActive` (bool)
- `bExternalAppFocused` (bool)
- `FocusedExternalApp` (string, often empty)
- `bSourceFilesModified` (bool)
- `ProductivityWeight` (float)
- `SnapshotChecksum` (MD5)

### Daily Summaries (5 files)

| File | Size | SessionCount | LongestSession |
|---|---|---|---|
| 2026-01-25.json | 759 bytes | unknown | unknown |
| 2026-01-26.json | 1,197 bytes | unknown | unknown |
| 2026-01-27.json | 661 bytes | unknown | unknown |
| 2026-01-28.json | 525 bytes | 3 | 1,757.8s (29.3 min) |
| 2026-01-29.json | 434 bytes | unknown | unknown |

**2026-01-28 AggregatedSummary confirmed:**
- TotalSeconds: 2,662.5 (44.4 min)
- ActiveSeconds: 0
- ThinkingSeconds: 47.2
- AwaySeconds: 2,615.3
- SecondsByApplication: {} (ExternalActivityMonitor not active)

### Active Session

| File | Size | SessionId | Started | Status |
|---|---|---|---|---|
| active_session.json | 1,195,820 bytes | 10F2D4204710955D9E1CE8BFE495DFE6 | 2026-06-08T22:42:31Z | Preserved by Phase 0 |

Phase 0 ran 2026-06-10 at 02:23. File copied to Recovery/2026-06-10_02-23/Telemetry/.

### Wellness Data

| File | Size | Content |
|---|---|---|
| HabitStreaks.json | 625 bytes | 27 stretches, 7 breaks, 2 days tracked, lastDate 2026-06-08 |

---

## Unreal Engine Logs

**Path:** C:\Users\daley\UnrealProjects\BaseGame\Saved\Logs\
**Count:** 15 files

| File | Size | Date | Notes |
|---|---|---|---|
| WizardJam2.0.log | 490,399 bytes | 2026-06-09 | Primary audit target; DPT startup confirmed |
| WizardJam2.0-backup-2026.06.08-05.52.05.log | 394,972 bytes | 2026-06-07 | |
| WizardJam2.0-pre_attempt1.log | 394,972 bytes | 2026-06-07 | Duplicate of above |
| WizardJam2.0-backup-2026.06.08-01.58.12.log | 204,351 bytes | 2026-06-07 | |
| WizardJam2.0-backup-2026.06.08-05.53.58.log | 291,821 bytes | 2026-06-07 | |
| WizardJam2.0-pre_attempt2.log | 291,821 bytes | 2026-06-07 | Duplicate |
| WizardJam2.0-backup-2026.06.08-05.55.31.log | 287,074 bytes | 2026-06-07 | |
| WizardJam2.0-pre_attempt3.log | 287,074 bytes | 2026-06-07 | Duplicate |
| WizardJam2.0-backup-2026.06.08-05.56.13.log | 285,481 bytes | 2026-06-07 | |
| WizardJam2.0-backup-2026.06.07-23.41.13.log | 247,037 bytes | 2026-06-07 | |
| build_20260607.log | 3,842 bytes | 2026-06-07 | C4458 error confirmed (see WIZARDJAM_AUDIT_PLAN.md) |
| build_20260607b.log | 3,348 bytes | 2026-06-07 | |
| build_20260607c.log | 2,899 bytes | 2026-06-07 | |
| UnrealVersionSelector-2026.01.24-22.25.09.log | 725,990 bytes | 2026-01-24 | |
| UnrealVersionSelector-2026.01.28-00.19.06.log | 726,932 bytes | 2026-01-28 | |

**Engine confirmed:** UE 5.4.4-35576357, Unreal Engine 5.4 Release
**Hardware confirmed:** AMD Ryzen 7 9800X3D, Windows 11 25H2
**DPT log categories confirmed in WizardJam2.0.log:**
- `LogProductivityTracker` -- module lifecycle
- `LogProductivitySession` -- session start/stop/recovery
- `LogProductivityStorage` -- file I/O
- `LogProductivitySessionData` -- session finalization

---

## WizardJam Source

**Path:** C:\Users\daley\UnrealProjects\BaseGame\Source\END2507\
**Total files:** 249
**Breakdown:** 115 .h headers, 101 .cpp implementations, 32 no-extension (build/config), 1 .cs

Architecture confirmed:
- `AIC_QuidditchController` present (confirmed by class forward declarations in 5 header files)
- `AQuidditchGameMode` present (referenced from 5 headers)
- `BTDecorator_IsSeeker` present
- `BTService_FindStagingZone` present

---

## Other Evidence

| File | Path | Size | Notes |
|---|---|---|---|
| Telemetry.json | Saved/Telemetry/ | 876,645 bytes | UE engine telemetry, updated 2026-06-09 |
| PackageRestoreData.json | Saved/Autosaves/ | 94 bytes | UE autosave state |
| UncontrolledChangelists.json | Saved/SourceControl/ | 4,722 bytes | Source control state |
| .fathom-server.json | Saved/Fathom/ | 213 bytes | Fathom plugin state |

---

## Summary

| Category | v1 Assumed | v2 Finding |
|---|---|---|
| DPT session files | MISSING | FOUND: 51 files |
| DPT daily summaries | MISSING | FOUND: 5 files |
| Active session | MISSING | FOUND: 1,195,820 bytes, Phase 0 preserved |
| UE log files | MISSING | FOUND: 15 files |
| WizardJam source | MISSING | FOUND: 249 files |
| v1 package quality | "8 stubs, 1,845 bytes" | v1.1: 14 full files, 29,826 bytes |
| DPT path | Saved/DeveloperProductivityTracker/ | Saved/ProductivityTracker/ (corrected) |
