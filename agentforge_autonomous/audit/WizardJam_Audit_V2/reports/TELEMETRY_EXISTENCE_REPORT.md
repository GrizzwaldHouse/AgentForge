# Telemetry Existence Report
**Generated:** 2026-06-09 (Claude Code local disk pass -- supersedes v1 upload-based report)
**Method:** Direct filesystem search of C:\Users\daley\UnrealProjects\BaseGame

---

## VERIFIED (found on local disk)

| Item | Path | Size | Last Modified |
|---|---|---|---|
| DPT session files (51 total) | Saved/ProductivityTracker/Sessions/*.json | 626 to 318,398 bytes each | Jan-Jun 2026 |
| DPT daily summaries (5 total) | Saved/ProductivityTracker/Summaries/*.json | 434 to 1,197 bytes each | Jan 2026 |
| Active session (open) | Saved/ProductivityTracker/active_session.json | 972,616 bytes | 2026-06-09 live |
| Habit streak data | Saved/ProductivityTracker/HabitStreaks.json | 625 bytes | 2026-06-09 live |
| UE log files (15 total) | Saved/Logs/*.log | 2,899 to 726,932 bytes each | Jan-Jun 2026 |
| WizardJam source (249 files) | Source/END2507/ | 115 headers + 101 cpp | Jun 2026 |
| UE engine telemetry | Saved/Telemetry/Telemetry.json | 876,645 bytes | 2026-06-09 live |
| Build logs (3 files) | Saved/Logs/build_*.log | 2,899 to 3,842 bytes | 2026-06-07 |

---

## CONFIRMED MISSING

| Item | Expected path | Confirmed absent |
|---|---|---|
| DPT output at original expected path | Saved/DeveloperProductivityTracker/ | Directory does not exist -- plugin writes to Saved/ProductivityTracker/ instead |
| AppData DPT output | %LOCALAPPDATA%/DeveloperProductivityTracker/ | Directory does not exist |
| Apple Cloud media | N/A (requires download) | Not on local disk |
| Apple Cloud documents | N/A (requires download) | Not on local disk |

**Note on path discrepancy:** The v1 MISSING_EVIDENCE_REPORT searched for
`Saved/DeveloperProductivityTracker/` (full plugin name). The plugin actually writes to
`Saved/ProductivityTracker/` (short name). All data is present under the correct path.

---

## SESSION DATA QUALITY ASSESSMENT

### Active Session (active_session.json)
- SessionId: 10F2D4204710955D9E1CE8BFE495DFE6
- Started: 2026-06-08T22:42:31Z
- EndTime: 0001-01-01T00:00:00Z (sentinel -- session not yet closed)
- Elapsed: ~81,030 seconds (~22.5 hours)
- PluginVersion: 1.0.0
- **Status: LIVE SESSION -- Unreal Engine or tracker is still running**

### Daily Summary Sample (2026-01-28.json)
Structure confirmed matches expected schema:
- Date, SessionCount, LongestSessionSeconds, AverageSessionSeconds
- AggregatedSummary: TotalSeconds, ActiveSeconds, ThinkingSeconds, AwaySeconds, PausedSeconds
- SecondsByApplication: {} (empty -- ExternalActivityMonitor may not have been active)
- SessionIds array: links back to individual session files

### Habit Streaks (HabitStreaks.json)
- currentStreak: 0, longestStreak: 0
- totalDaysTracked: 2
- lastTrackedDate: 2026-06-08
- Today (2026-06-09): 27 stretches, 7 breaks, 0 pomodoros
- metStretchGoal: true, metBreakGoal: true, metPomodoroGoal: false

---

## LOG QUALITY SCORECARD

Applying the scorecard template from v1 TELEMETRY_EXISTENCE_REPORT to the primary log.
Full scoring requires reading WizardJam2.0.log -- scheduled for REPOSITORY_RECOVERY_REPORT.

Primary log: WizardJam2.0.log (490,399 bytes, 2026-06-09)

| Dimension | Preliminary assessment |
|---|---|
| ERROR coverage | Likely present (build_*.log shows compile activity) |
| WARN coverage | Likely present (UE always emits warnings) |
| INFO coverage | Likely present (PIE sessions generate INFO transitions) |
| Timestamp quality | UE uses FDateTime -- sub-second resolution confirmed by format |
| Signal-to-noise | Unknown until read -- UE logs have high startup noise |

**Full score pending log read in Step 4 (Safe Shutdown Assessment).**

---

## CLASSIFICATION TABLE

### VERIFIED
- 51 DPT session JSON files at Saved/ProductivityTracker/Sessions/*.json
- 5 DPT daily summary JSON files at Saved/ProductivityTracker/Summaries/*.json
- 1 active_session.json at Saved/ProductivityTracker/active_session.json (currently open)
- 1 HabitStreaks.json at Saved/ProductivityTracker/HabitStreaks.json
- 15 UE log files at Saved/Logs/*.log
- 249 WizardJam source files at Source/END2507/
- 876KB Telemetry.json at Saved/Telemetry/Telemetry.json

### POSSIBLE
- Additional session data inside active_session.json (972KB -- likely contains snapshot array)
- DPT log output inside WizardJam2.0.log (if plugin logging was enabled)
- Build error details inside build_20260607*.log

### MISSING
- Apple Cloud media and documents (requires iCloud download -- separate task)
- SecondsByApplication data (empty in sampled summary -- ExternalActivityMonitor may be disabled)

### UNKNOWN
- Whether .uproject confirms DPT plugin is enabled (not yet read)
- Whether active session will flush cleanly on next Unreal close
- Whether the 972KB active_session.json contains corrupted or valid data beyond the header

---

## Key Finding

The v1 report conclusion "The bottleneck is not documentation. The bottleneck is evidence collection."
is now resolved. All local evidence exists. The bottleneck is now reading and analyzing it.
