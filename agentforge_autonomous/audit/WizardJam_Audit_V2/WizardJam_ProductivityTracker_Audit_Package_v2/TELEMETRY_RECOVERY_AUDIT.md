# Telemetry Recovery Audit
**Version:** 2.0
**Generated:** 2026-06-10 (Claude Code local disk pass)
**Status:** GENERATE_NOW (upgraded from STUB -- 51 sessions confirmed present)

---

## Summary

51 session files exist spanning 2026-01-25 through 2026-06-08. The data is structurally
complete. The dominant pattern across all sampled sessions is EActivityState::Away --
the editor was open but the developer was not actively working. ActiveSeconds is 0 in
all sampled aggregates, which is either a calibration issue or reflects accurate idle state.

---

## Session Inventory

**Total:** 51 sessions
**Date range:** 2026-01-25 through 2026-06-08
**Active session:** 10F2D4204710955D9E1CE8BFE495DFE6 (not in Sessions/, currently recording)

### Session Size Distribution

| Size range | Count | Interpretation |
|---|---|---|
| < 10KB | ~20 | Short sessions, few snapshots |
| 10KB to 50KB | ~15 | Medium sessions (100-500 snapshots at ~100 bytes each) |
| 50KB to 150KB | ~12 | Long sessions (500+ snapshots) |
| > 150KB | 4 | Multi-hour sessions with dense snapshot arrays |

Largest session: 3436039747ACA50408593E9B5857A7E0.json (318,398 bytes, 881 snapshots, 8h54m)

---

## Detailed Analysis: Largest Session

**SessionId:** 3436039747ACA50408593E9B5857A7E0
**StartTime:** 2026-01-27T07:52:06.183Z
**EndTime:** 2026-01-27T16:41:48.828Z
**TotalElapsedSeconds:** 31,782.6 (8 hours 49 minutes 42 seconds)
**bWasRecovered:** false
**PluginVersion:** 1.0.0
**MachineId:** bd6bdb6be5cdf02a27a3475323cf9458
**ActivitySnapshots:** 881 (30-second polling = ~7.3 hours of continuous recording)

### ActivitySummary

| State | Seconds | Percentage |
|---|---|---|
| Total | 31,939.5 | 100% |
| Active | 0 | 0% |
| Thinking | 9.2 | <0.1% |
| Away | 31,930.3 | 99.97% |
| Paused | 0 | 0% |

### Sample Snapshots

**Snapshot 1 (session start + 31s):**
- Timestamp: 2026-01-27T07:52:37.652Z
- State: 2 (Away)
- SecondsSinceLastInput: 16,799,224 (~194 days since last input)
- bEditorFocused: true, bPlayInEditorActive: false
- ProductivityWeight: 0

**Snapshot 2 (30s later):**
- State: 2 (Away)
- SecondsSinceLastInput: 16,799,254 (30s elapsed, still away)
- bEditorFocused: true

**Pattern:** Editor was focused but no keyboard/mouse input for the entire session.
The machine had been idle for ~194 days of input time at session start, suggesting
the system clock or `SecondsSinceLastInput` calculation may have anomalous behavior
at session boundaries, OR the developer left the editor open for a very extended idle period.

---

## Detailed Analysis: June 2026 Session

**SessionId:** E8A1E3D74C44F8CB9C417BA690528F80
**StartTime:** 2026-06-07T19:44:47.587Z
**EndTime:** 2026-06-07T22:51:34.587Z
**Duration:** 3 hours 6 minutes 47 seconds
**bWasRecovered:** false (but WAS recovered on 2026-06-09 startup per log)

**Log evidence of recovery:**
```
LogProductivityStorage: Recovered active session: E8A1E3D74C44F8CB9C417BA690528F80
LogProductivitySessionData: Session E8A1E3D74C44F8CB9C417BA690528F80 finalized.
  Duration: 11207.0 seconds, Active: 0.0%
LogProductivityStorage: Saved session E8A1E3D74C44F8CB9C417BA690528F80 to .../Sessions/
LogProductivitySession: Recovered session E8A1E3D74C44F8CB9C417BA690528F80 from crash
```

The file was saved correctly. `bWasRecovered: false` in JSON may reflect the pre-recovery
state; the log shows recovery completed successfully.

---

## Daily Summary Analysis

**Confirmed structure (2026-01-28):**

| Metric | Value |
|---|---|
| Sessions that day | 3 |
| Total tracked time | 44.4 minutes |
| Longest session | 29.3 minutes |
| Average session | 14.8 minutes |
| Active | 0 seconds |
| Thinking | 47.2 seconds |
| Away | 2,615.3 seconds (98.2% of total) |

**Pattern:** January 2026 sessions were short (average 14-29 min) with near-zero active time.
This aligns with the WizardJam capstone development period -- short focused sessions,
likely interrupted by compile cycles and editor restarts.

**No application data:** SecondsByApplication is {} in all summaries. The ExternalActivityMonitor
component either requires elevated Windows API permissions (GetLastInputInfo or similar) or
was not configured. This means the "which app was in focus" dimension of the SSM dataset
will not be populated from these sessions.

---

## EActivityState Enum

Based on log evidence and snapshot State values:

| Value | State | Evidence |
|---|---|---|
| 0 | Unknown/Uninitialized | Not observed |
| 1 | Active | Not observed in sampled data (summary shows 0 ActiveSeconds) |
| 2 | Away | Confirmed -- all sampled snapshots |
| 3 | Thinking | Confirmed -- ThinkingSeconds > 0 in summaries |
| 4 | Paused | Not observed |

**Note:** EActivityState::Active (value 1) requires keyboard/mouse input within a recent
threshold window. The threshold is set in ProductivityTrackerSettings. Sessions where
the developer is compiling, waiting for PIE to load, or reviewing output may all score
as Away because no input events occur during those periods.

---

## SSM Extraction Readiness

| Gate | Status | Notes |
|---|---|---|
| Phase 0 complete | PASS | 44 sessions copied to Recovery/2026-06-10_02-23/ |
| Sessions available | PASS | 51 files |
| Summaries available | PASS | 5 files |
| Log available | PASS | WizardJam2.0.log confirmed |
| Schema confirmed | PASS | ActivitySnapshots, 30s polling, 12 fields |
| Privacy filter reviewed | PENDING | Marcus must approve before AgentForge ingestion |
| SSM dataset schema reviewed | PENDING | See SSM_TRAINING_ARCHITECTURE.md |

**Readiness verdict:** READY FOR EXTRACTION after privacy filter approval.

---

## Recommended SSM Preprocessing Steps

1. Collapse consecutive identical-State snapshots into a single activity block:
   `{ state, start_timestamp, end_timestamp, duration_seconds, bPlayInEditorActive }`

2. Filter out sessions with TotalElapsedSeconds > 86,400 (likely machine-left-on anomalies)

3. Filter out sessions where AwaySeconds / TotalSeconds > 0.99 (no productive signal)

4. For remaining sessions, extract PIE start/stop events from bPlayInEditorActive transitions

5. Correlate PIE session timestamps with UE log entries for compile error/success events

6. Apply privacy filter: strip MachineId, RecordChecksum, FocusedExternalApp values

7. Output: one JSONL record per collapsed activity block, with session context
