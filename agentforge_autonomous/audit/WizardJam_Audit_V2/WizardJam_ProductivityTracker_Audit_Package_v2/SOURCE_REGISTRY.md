# Source Registry
**Version:** 2.0
**Generated:** 2026-06-10

All paths verified on local disk during Claude Code audit session 2026-06-09/10.

---

## Primary Repositories

| Repository | Local path | Status | Notes |
|---|---|---|---|
| AgentForge | C:/Users/daley/Projects/SeniorDevBuddy/agentforge_autonomous | ACTIVE | Branch: feat/pdf-session-1-weasyprint; 126 modified/untracked files |
| WizardJam 2.0 | C:/Users/daley/UnrealProjects/BaseGame | ACTIVE | UE 5.4.4; 249 source files at Source/END2507/ |
| DeveloperProductivityTracker | Embedded plugin in BaseGame | ACTIVE | Version 1.0.0; output at Saved/ProductivityTracker/ |
| VetAssist | (separate repo) | PRESENT | 434 TypeScript files from v1 upload |

---

## DeveloperProductivityTracker Output Paths

All paths relative to C:/Users/daley/UnrealProjects/BaseGame/

| Path | Contents | Count | Size range |
|---|---|---|---|
| Saved/ProductivityTracker/Sessions/ | Session JSON files | 51 | 626 bytes to 318,398 bytes |
| Saved/ProductivityTracker/Summaries/ | Daily summary JSON files | 5 | 434 to 1,197 bytes |
| Saved/ProductivityTracker/active_session.json | Currently open session | 1 | 1,195,820 bytes |
| Saved/ProductivityTracker/HabitStreaks.json | Wellness streak data | 1 | 625 bytes |

**Do not use:** `Saved/DeveloperProductivityTracker/` -- this directory does not exist.

---

## WizardJam 2.0 Source Structure

| Path | Contents | Count |
|---|---|---|
| Source/END2507/ | All game source | 249 files |
| Source/END2507/*.h | Header files | 115 |
| Source/END2507/*.cpp | Implementation files | 101 |
| Source/END2507/ (other) | Build scripts, config | 32 + 1 .cs |

**Confirmed architecture files:**

| File | Confirmed | Method |
|---|---|---|
| AIC_QuidditchController.h/.cpp | YES | Forward declaration in 5 headers; build error at line 651 |
| QuidditchGameMode (class) | YES | Referenced from AIC_QuidditchController.h, BTDecorator_IsSeeker.h, BTService_FindStagingZone.h, QuidditchDebugWidget.h, WizardJamQuidditchWidget.h |
| BTDecorator_IsSeeker.h | YES | Direct filename match |
| BTService_FindStagingZone.h | YES | Direct filename match |
| QuidditchDebugWidget.h | YES | Direct filename match |
| WizardJamQuidditchWidget.h | YES | Direct filename match |

---

## Unreal Engine Logs

All paths relative to C:/Users/daley/UnrealProjects/BaseGame/Saved/Logs/

| File | Size | Date | Purpose |
|---|---|---|---|
| WizardJam2.0.log | 490,399 bytes | 2026-06-09 | Primary session log; DPT startup confirmed |
| build_20260607.log | 3,842 bytes | 2026-06-07 | C4458 compile error in AIC_QuidditchController.cpp |
| build_20260607b.log | 3,348 bytes | 2026-06-07 | Build attempt 2 |
| build_20260607c.log | 2,899 bytes | 2026-06-07 | Build attempt 3 |
| WizardJam2.0-backup-*.log (8 files) | 204K to 395K | 2026-06-07/08 | Backup copies from multiple load attempts |
| UnrealVersionSelector-*.log (2 files) | ~726K each | 2026-01-24/28 | UE version selector logs |

---

## Phase 0 Recovery Archive

| Path | Contents | Created |
|---|---|---|
| C:/Users/daley/Recovery/2026-06-10_02-23/Logs/ | 22 log files | 2026-06-10 02:23 |
| C:/Users/daley/Recovery/2026-06-10_02-23/Sessions/ | 44 session files | 2026-06-10 02:23 |
| C:/Users/daley/Recovery/2026-06-10_02-23/Summaries/ | 5 summary files | 2026-06-10 02:23 |
| C:/Users/daley/Recovery/2026-06-10_02-23/Telemetry/active_session.json | 1,195,820 bytes | 2026-06-10 02:23 |
| C:/Users/daley/Recovery/2026-06-10_02-23/Telemetry/HabitStreaks.json | 625 bytes | 2026-06-10 02:23 |
| C:/Users/daley/Recovery/2026-06-10_02-23/MANIFEST.txt | File list | 2026-06-10 02:23 |

Total files preserved: 73

---

## AgentForge Source Registry

All paths relative to C:/Users/daley/Projects/SeniorDevBuddy/agentforge_autonomous/

| Path | Purpose | Status |
|---|---|---|
| src/core/interfaces/Agent.ts | Core agent interface | ACTIVE |
| src/core/events/agent-event-bus.ts | EventBus singleton | ACTIVE |
| src/agents/job-pipeline/ | A1-A4 pipeline agents | ACTIVE |
| src/agents/resume-pipeline/ | A5 resume/VMock agents | ACTIVE |
| apps/job-agent/config/settings.json | Single config source of truth | ACTIVE |
| docs/audit/ | ChatGPT audit docs (8 files, 2026-05-09) | READ-ONLY |
| audit/WizardJam_Audit_V2/ | This audit package | ACTIVE |

---

## Missing Sources (Not on Local Disk)

| Source | Expected location | Blocker |
|---|---|---|
| Apple Cloud photos | iCloud (not downloaded) | Requires iCloud for Windows or Mac Photos sync |
| Apple Cloud videos | iCloud (not downloaded) | Same |
| Apple Cloud documents | iCloud (not downloaded) | Same |
