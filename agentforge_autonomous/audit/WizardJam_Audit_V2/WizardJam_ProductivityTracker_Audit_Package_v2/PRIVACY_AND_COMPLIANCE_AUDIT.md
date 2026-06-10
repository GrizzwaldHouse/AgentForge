# Privacy and Compliance Audit
**Version:** 2.0
**Generated:** 2026-06-10 (updated from v1 with runtime findings)

---

## Data Categories Collected by DPT

| Data type | Field | Sensitivity | Disposition |
|---|---|---|---|
| Session timing | StartTime, EndTime, TotalElapsedSeconds | LOW | Safe to retain |
| Activity state | State (enum), ProductivityWeight | LOW | Safe to retain |
| Input idle time | SecondsSinceLastInput | LOW | Safe to retain |
| Editor focus | bEditorFocused, bPlayInEditorActive | LOW | Safe to retain |
| External app focus | bExternalAppFocused, FocusedExternalApp | MEDIUM | Strip app name before AgentForge ingestion |
| Application time | SecondsByApplication | MEDIUM (when populated) | Strip app names; retain durations only |
| Machine identity | MachineId | MEDIUM | Strip before AgentForge ingestion |
| Checksum | RecordChecksum, SnapshotChecksum | LOW (metadata) | Strip (not useful for SSM training) |
| Wellness data | HabitStreaks.json contents | LOW | Safe to retain as aggregate |
| Source change events | bSourceFilesModified | LOW | Safe to retain |

---

## Runtime Compliance Finding

**ExternalActivityMonitor is inactive in all sampled sessions.**

SecondsByApplication is `{}` (empty object) in every summary file and every session's
ActivitySummary. This means the application-level tracking dimension -- the one most
likely to capture personally sensitive app names (messaging apps, browsers with page
titles, etc.) -- is not collecting data.

This is both a data gap (no app-level signal for SSM) and a privacy benefit (no
accidental capture of personal application usage).

---

## Privacy Gate (Mandatory Before AgentForge Ingestion)

The following gate applies to ALL DPT data before it enters AgentForge memory:

```
Raw session data
  -> Privacy Filter
       Strip: MachineId, RecordChecksum, SnapshotChecksum
       Strip: FocusedExternalApp values (retain key, set value to [REDACTED])
       Strip: SecondsByApplication keys (retain durations, replace app names with [APP_N])
       Retain: all timing fields, state fields, boolean flags
  -> SSM_DATASET.jsonl
  -> AgentForge memory
```

**Never skip this gate.** Raw session data is never ingested directly.

---

## Apple Cloud Privacy Gate (Separate Gate)

Apple Cloud data (photos, videos, documents) requires a separate and stricter gate:

| Category | Gate requirement |
|---|---|
| Family photos/videos | Privacy filter + Marcus explicit approval per batch |
| Personal documents | Privacy filter + classification (business vs. personal) |
| Medical records | EXCLUDED -- never ingest |
| Financial credentials | EXCLUDED -- never ingest |
| Marital communications | EXCLUDED -- never ingest |

The Apple Cloud gate is not yet active because the download has not occurred.
See APPLE_CLOUD_RECOVERY_AUDIT.md for download instructions.

---

## GDPR / Data Minimization

The DPT plugin collects only behavioral signals from the developer's own machine.
No network transmission occurs (all data written to local Saved/ directory).
No personal identifiers beyond MachineId (a hashed hardware identifier, not a name).

Data minimization compliance:
- Session data is stored locally only
- No cloud sync (confirmed: files found only at BaseGame/Saved/ProductivityTracker/)
- Retention: indefinite (no auto-deletion); Marcus controls deletion
- Access: local machine only; no multi-user sharing

---

## SSM Dataset Privacy Checklist

Before running SSM extraction:

- [ ] MachineId stripped from all session files in dataset
- [ ] RecordChecksum and SnapshotChecksum stripped (not useful, mildly identifying)
- [ ] FocusedExternalApp values replaced with [APP_NAME_REDACTED]
- [ ] SecondsByApplication keys replaced with [APP_N] tokens (if any data is present)
- [ ] Marcus has reviewed and approved the SSM_DATASET.jsonl schema
- [ ] Privacy filter code is reviewed before first run
- [ ] Output dataset stored at a known path (not accidentally committed to git)

---

## Compliance Summary

| Category | Status |
|---|---|
| Local-only storage | CONFIRMED |
| No network transmission | CONFIRMED |
| No personal identifiers (name, email) | CONFIRMED |
| ExternalActivityMonitor inactive | CONFIRMED (privacy benefit) |
| Apple Cloud gate defined | DEFINED, not yet active |
| SSM privacy filter designed | DESIGNED, not yet implemented |
| GDPR data minimization | MET for current local data |
