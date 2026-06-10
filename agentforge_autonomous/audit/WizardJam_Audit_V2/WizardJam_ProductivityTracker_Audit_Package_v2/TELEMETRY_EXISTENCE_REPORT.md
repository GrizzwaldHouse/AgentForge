# Telemetry Existence Report
**Version:** 2.0
**Generated:** 2026-06-10 (Claude Code local disk pass)
**Method:** Direct filesystem search + JSON reads + UE log analysis

---

## VERIFIED

| Item | Path | Count | Size | Last modified |
|---|---|---|---|---|
| DPT session files | Saved/ProductivityTracker/Sessions/*.json | 51 | 626 to 318,398 bytes | Jan-Jun 2026 |
| DPT daily summaries | Saved/ProductivityTracker/Summaries/*.json | 5 | 434 to 1,197 bytes | Jan 2026 |
| Active session | Saved/ProductivityTracker/active_session.json | 1 | 1,195,820 bytes | 2026-06-09 live |
| Habit streak data | Saved/ProductivityTracker/HabitStreaks.json | 1 | 625 bytes | 2026-06-09 live |
| UE log files | Saved/Logs/*.log | 15 | 2,899 to 726,932 bytes | Jan-Jun 2026 |
| WizardJam source | Source/END2507/ | 249 | varies | Jun 2026 |
| UE engine telemetry | Saved/Telemetry/Telemetry.json | 1 | 876,645 bytes | 2026-06-09 live |
| Build logs | Saved/Logs/build_*.log | 3 | 2,899 to 3,842 bytes | 2026-06-07 |
| DPT log output | WizardJam2.0.log (LogProductivityTracker, LogProductivitySession, LogProductivityStorage) | 10+ lines | in 490KB log | 2026-06-09 |

---

## CONFIRMED MISSING

| Item | Expected path | Confirmed absent |
|---|---|---|
| DPT output at v1 expected path | Saved/DeveloperProductivityTracker/ | Directory does not exist |
| AppData DPT output | %LOCALAPPDATA%/DeveloperProductivityTracker/ | Directory does not exist |
| Apple Cloud media | N/A (requires download) | Not on local disk |
| SecondsByApplication data | Inside Summaries/*.json | Present as key but value is always {} |

---

## Session Data Schema (Confirmed)

**Source:** 3436039747ACA50408593E9B5857A7E0.json (318,398 bytes, 881 snapshots, Jan 27 2026)

Top-level keys: `ActivitySnapshots`, `ActivitySummary`, `bWasRecovered`, `EndTime`,
`LinkedTaskId`, `MachineId`, `PluginVersion`, `RecordChecksum`, `SessionId`,
`StartTime`, `TotalElapsedSeconds`

**ActivitySnapshot** (30-second polling, not event-driven):

| Field | Type | Notes |
|---|---|---|
| Timestamp | ISO 8601 UTC | Sub-second precision |
| State | int | 2 = EActivityState::Away; confirmed from SecondsSinceLastInput values |
| SecondsSinceLastInput | float | 16,799,224 observed -- machine idle for extended period |
| bEditorFocused | bool | Window focus state |
| bPlayInEditorActive | bool | PIE session running |
| bExternalAppFocused | bool | Another app has focus |
| FocusedExternalApp | string | App name; empty in all sampled data |
| bSourceFilesModified | bool | File system change detected |
| ProductivityWeight | float | Calculated score; 0 when Away |
| SnapshotChecksum | string | MD5 of snapshot content |

**SSM pipeline note:** The field is `ActivitySnapshots`, not `Events` or `StateTransitions`.
Consecutive snapshots with identical State values represent a single activity block and
should be collapsed before SSM training (do not treat 881 snapshots as 881 discrete events).

---

## Daily Summary Schema (Confirmed)

**Source:** 2026-01-28.json (525 bytes, 3 sessions)

| Field | Value (2026-01-28) |
|---|---|
| Date | 2026-01-28T00:00:00.000Z |
| SessionCount | 3 |
| LongestSessionSeconds | 1,757.8 (29.3 min) |
| AverageSessionSeconds | 887.5 (14.8 min) |
| AggregatedSummary.TotalSeconds | 2,662.5 (44.4 min) |
| AggregatedSummary.ActiveSeconds | 0 |
| AggregatedSummary.ThinkingSeconds | 47.2 |
| AggregatedSummary.AwaySeconds | 2,615.3 |
| AggregatedSummary.PausedSeconds | 0 |
| AggregatedSummary.SecondsByApplication | {} (empty) |
| SessionIds | Array of 3 session IDs |

**Key finding:** ActiveSeconds is 0 across all sampled sessions. The DPT is tracking
time correctly (sessions recorded, durations measured) but the EActivityState::Active
state is either rarely reached or its threshold requires calibration.

---

## Habit Streak Schema (Confirmed)

**Source:** HabitStreaks.json (625 bytes, 2026-06-09)

- currentStreak: 0, longestStreak: 0
- totalDaysTracked: 2
- lastTrackedDate: 2026-06-08
- Today (2026-06-09): 27 stretches, 7 breaks, 0 pomodoros
- metStretchGoal: true, metBreakGoal: true, metPomodoroGoal: false

---

## Log Quality Scorecard

**Primary log:** WizardJam2.0.log (490,399 bytes, 2026-06-09)

| Dimension | Score | Evidence |
|---|---|---|
| DPT log output present | PASS | LogProductivityTracker, LogProductivitySession, LogProductivityStorage all confirmed |
| Crash recovery logged | PASS | Session E8A1E3D74C recovered; finalization logged with duration |
| PIE session evidence | PASS | bPlayInEditorActive field in snapshots; "Failed to cast pawn to BaseCharacter" runtime errors |
| Compile error evidence | PASS | C4458 at AIC_QuidditchController.cpp:651 in build_20260607.log |
| Delegate binding | PASS | Death delegate bound for BP_QuidditchAgent_C_0/1/2 (multiple entries) |
| MCP bridge | PASS | EpicUnrealMCPBridge on 127.0.0.1:55557; MCPCommandPanel polling 8000 |
| Timestamp quality | PASS | UE FDateTime with millisecond precision, e.g. [2026.06.09-05.42.31:194] |
| Signal-to-noise | ACCEPTABLE | High startup noise (plugin mounts, config loads) before meaningful DPT entries |

**Log quality score: GOOD** -- sufficient for SSM extraction after noise filtering.

---

## Classification Table

### VERIFIED
- 51 DPT session JSON files
- 5 DPT daily summary JSON files
- active_session.json (1.14MB, Phase 0 preserved)
- HabitStreaks.json
- 15 UE log files with DPT output confirmed in primary log
- 249 WizardJam source files
- ActivitySnapshot schema confirmed (30s polling, 12 fields per snapshot)

### POSSIBLE
- Additional state transitions within active_session.json (1.14MB -- snapshot array not fully enumerated)
- Build error details in build_20260607b.log and build_20260607c.log (not read in full)
- Additional runtime cast errors beyond the 10 sampled

### MISSING
- Apple Cloud media and documents (requires iCloud download)
- SecondsByApplication data (key present, value always empty)

### UNKNOWN
- Whether .uproject explicitly enables DPT (confirmed running via log; uproject not read)
- Why ActiveSeconds is 0 in all sampled sessions (threshold calibration or EActivityState::Active condition not met)

---

## Key Finding

The v1 conclusion "bottleneck is evidence collection" is resolved.
All local evidence exists and the data schema is confirmed.
The bottleneck is now analysis: reading and extracting signal from 51 session files,
scoring the full log, and verifying C1/C2/C3 claims against 249 source files.
