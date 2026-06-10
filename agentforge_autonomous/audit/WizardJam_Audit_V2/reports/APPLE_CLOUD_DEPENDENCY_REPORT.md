# Apple Cloud Dependency Report
**Generated:** 2026-06-09 (Claude Code local disk pass)

---

## Current Status

Apple Cloud download: NOT STARTED
Zero Apple Cloud media or document files found on local disk.
This is the only remaining high-priority evidence gap after the local disk search.

---

## What Is and Is Not Blocked

### NOT blocked by Apple Cloud (all found on local disk)
- DPT session telemetry analysis (51 sessions present)
- WizardJam source audit (249 files present)
- UE log quality scoring (15 log files present)
- Safe shutdown assessment (complete)
- Repository recovery (complete)
- V2 generation for all non-media sections

### Blocked by Apple Cloud
- APPLE_CLOUD_RECOVERY_AUDIT.md (full analysis)
- Media catalog and hash verification
- Duplicate detection across media files
- Family archive recovery planning
- AgentForge memory integration for media (privacy gate required first)
- Time Capsule asset recovery

---

## Download Instructions

On Marcus's Mac (or Windows with iCloud for Windows installed):

**Option A -- Mac:**
1. Open Photos app, go to Preferences > iCloud
2. Select "Download Originals to this Mac"
3. Wait for full sync (may take hours depending on library size)
4. For Documents: open Finder > iCloud Drive, wait for full download indicator

**Option B -- Windows with iCloud for Windows:**
1. Install iCloud for Windows from the Microsoft Store if not present
2. Sign in with your Apple ID
3. Enable iCloud Drive and iCloud Photos in iCloud for Windows settings
4. Wait for sync to complete

**Target recovery folder structure:**
```
C:/Users/daley/Recovery/2026-06-09/
├── Photos/
├── Videos/
├── Documents/
├── FamilyArchive/
└── TimeCapsule/
```

---

## Privacy Gate (Mandatory Before AgentForge Ingestion)

Per ChatMiner privacy rule, raw media must pass through a privacy filter before
entering AgentForge memory. The pipeline is:

```
Export -> Privacy Filter -> Knowledge Extractor -> Business Memory
```

**Automatically excluded from AgentForge ingestion:**
- Marital communications
- Medical records
- Financial account credentials
- Family-private content not flagged for business use

Never skip this gate. Raw Apple Cloud content is never ingested directly.

---

## Hash Verification (Run After Download)

```powershell
# PowerShell -- run after download completes
$RECOVERY = "C:/Users/daley/Recovery/2026-06-09"
Get-ChildItem -Recurse $RECOVERY -File |
  ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm MD5).Hash
    "$hash  $($_.FullName)"
  } | Out-File "$RECOVERY/MANIFEST.md5"
Write-Output "Manifest written: $RECOVERY/MANIFEST.md5"
```

---

## V2 Impact

The APPLE_CLOUD_RECOVERY_AUDIT.md section in V2 will be a STUB until download completes.
It will contain:
- This dependency report (copied in)
- The template for what the full audit will contain
- The exact input required: path to downloaded Recovery/ folder
- The privacy gate checklist

All other V2 sections are unaffected by Apple Cloud status.
