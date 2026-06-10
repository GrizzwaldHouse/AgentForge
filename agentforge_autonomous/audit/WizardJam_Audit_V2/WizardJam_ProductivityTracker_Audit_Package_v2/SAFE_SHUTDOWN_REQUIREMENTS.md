# Safe Shutdown Requirements
**Version:** 2.0
**Generated:** 2026-06-10
**Final verdict:** SAFE TO CLOSE -- Phase 0 complete

---

## Phase 0 Status: COMPLETE

Phase 0 was executed by Claude Code on 2026-06-10 at 02:23.

| Item | Copied to | Status |
|---|---|---|
| Logs (22 files) | Recovery/2026-06-10_02-23/Logs/ | COPIED |
| Sessions (44 files) | Recovery/2026-06-10_02-23/Sessions/ | COPIED |
| Summaries (5 files) | Recovery/2026-06-10_02-23/Summaries/ | COPIED |
| active_session.json (1,195,820 bytes) | Recovery/2026-06-10_02-23/Telemetry/ | COPIED |
| HabitStreaks.json | Recovery/2026-06-10_02-23/Telemetry/ | COPIED |
| MANIFEST.txt | Recovery/2026-06-10_02-23/ | WRITTEN |
| **Total** | | **73 files** |

The active session (10F2D4204710955D9E1CE8BFE495DFE6) is preserved. It is safe to close
Unreal Engine. The DPT crash recovery path (`FOnSessionRecovered`) is confirmed working
and will finalize the session on next startup.

---

## Shutdown Checklist

| Step | Description | Status |
|---|---|---|
| Phase 0 | Copy all session data to Recovery/ | DONE |
| Stop PIE | Escape key in UE Editor | Manual action required |
| Save All | Ctrl+Shift+S in UE | Manual action required |
| Editor screenshot | Win+Shift+S before closing | Optional (recommended) |
| Close UE | File > Exit | Proceed when ready |

---

## What Happens When UE Closes

1. The DPT `SessionTrackingSubsystem` receives `EndPlay`
2. It writes the final state of active_session.json to Sessions/ with EndTime set
3. The session file joins the 51 existing session files
4. Next startup: no recovery needed (clean shutdown)

If UE crashes instead of closing cleanly:
1. Next startup triggers `FOnSessionRecovered`
2. The session is finalized with duration from StartTime to crash time
3. Active: 0.0% (same as all prior recovered sessions)
4. Confirmed working: E8A1E3D74C44F8CB9C417BA690528F80 recovered successfully 2026-06-09

---

## Phase 0 Script (For Future Reference)

```powershell
$RECOVERY_ROOT = "C:/Users/daley/Recovery/$(Get-Date -Format 'yyyy-MM-dd_HH-mm')"
$UE_ROOT = "C:/Users/daley/UnrealProjects/BaseGame"

New-Item -ItemType Directory -Force "$RECOVERY_ROOT/Logs" | Out-Null
New-Item -ItemType Directory -Force "$RECOVERY_ROOT/Sessions" | Out-Null
New-Item -ItemType Directory -Force "$RECOVERY_ROOT/Summaries" | Out-Null
New-Item -ItemType Directory -Force "$RECOVERY_ROOT/Telemetry" | Out-Null

Copy-Item "$UE_ROOT/Saved/Logs/*" "$RECOVERY_ROOT/Logs/" -ErrorAction SilentlyContinue
Copy-Item "$UE_ROOT/Saved/ProductivityTracker/Sessions/*" "$RECOVERY_ROOT/Sessions/" -ErrorAction SilentlyContinue
Copy-Item "$UE_ROOT/Saved/ProductivityTracker/Summaries/*" "$RECOVERY_ROOT/Summaries/" -ErrorAction SilentlyContinue
Copy-Item "$UE_ROOT/Saved/ProductivityTracker/active_session.json" "$RECOVERY_ROOT/Telemetry/" -ErrorAction SilentlyContinue
Copy-Item "$UE_ROOT/Saved/ProductivityTracker/HabitStreaks.json" "$RECOVERY_ROOT/Telemetry/" -ErrorAction SilentlyContinue

Get-ChildItem -Recurse $RECOVERY_ROOT -File | ForEach-Object {
    "$($_.FullName)  $($_.Length) bytes  $($_.LastWriteTime)"
} | Out-File "$RECOVERY_ROOT/MANIFEST.txt"

$count = (Get-ChildItem -Recurse $RECOVERY_ROOT -File | Where-Object { $_.Name -ne "MANIFEST.txt" }).Count
Write-Output "SESSION PRESERVATION COMPLETE: $count files preserved to $RECOVERY_ROOT"
```

---

## Historical Shutdown Events

| Date | Session | Duration | Active% | Recovery type |
|---|---|---|---|---|
| 2026-06-09 | E8A1E3D74C44F8CB9C417BA690528F80 | 11,207s (3.1h) | 0% | Crash recovery (FOnSessionRecovered) |
| 2026-06-10 | 10F2D4204710955D9E1CE8BFE495DFE6 | ~27h open | TBD | Clean shutdown or next-startup recovery |

The active session (started 2026-06-08T22:42:31Z) was open for approximately 27 hours
when Phase 0 ran. This is the longest recorded session. Whether it records meaningful
activity depends on whether PIE was run during that window.
