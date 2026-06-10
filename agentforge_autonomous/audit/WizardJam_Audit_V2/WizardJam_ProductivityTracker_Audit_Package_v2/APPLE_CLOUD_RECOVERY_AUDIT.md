# Apple Cloud Recovery Audit
**Version:** 2.0
**Status:** STUB -- PENDING_EVIDENCE
**Required input:** iCloud download to local disk + confirmed path
**Generated:** 2026-06-10

---

## Why This File Is a Stub

Zero Apple Cloud media or document files exist on local disk.
This is the only remaining evidence gap after the Claude Code local disk pass.
All other V2 sections are complete. This section does not block any other V2 file.

---

## What This File Will Contain When Evidence Arrives

| Section | Content |
|---|---|
| Media catalog | Photo/video file count, date range, total size |
| Duplicate detection | Files present in both local disk and Apple Cloud |
| Document inventory | iCloud Drive document list, business-relevant items |
| Family archive | Personal media inventory (privacy-gated; never ingested raw) |
| Time Capsule recovery | Older backup files recovered from Apple Cloud |
| AgentForge ingestion plan | Which items pass privacy gate and enter business memory |

---

## Download Instructions

**Option A -- Mac:**
1. Open Photos > Preferences > iCloud > Download Originals to this Mac
2. Wait for full sync (may take hours)
3. For documents: Finder > iCloud Drive, wait for download indicators

**Option B -- Windows with iCloud for Windows:**
1. Install iCloud for Windows from Microsoft Store
2. Sign in with Apple ID
3. Enable iCloud Drive and iCloud Photos in settings
4. Wait for sync to complete

**Target recovery path:**
```
C:/Users/daley/Recovery/[YYYY-MM-DD]/
├── Photos/
├── Videos/
├── Documents/
├── FamilyArchive/
└── TimeCapsule/
```

---

## Privacy Gate (Mandatory -- Never Skip)

```
Downloaded files
  -> Privacy Filter
       Automatically excluded: marital communications, medical records,
       financial credentials, family-private content
  -> Knowledge Extractor
       Only business-relevant facts extracted (project notes, client work, code)
  -> Business Memory (AgentForge)
```

Raw Apple Cloud content is never ingested directly into AgentForge memory.
Marcus must explicitly approve each batch before ingestion.

---

## Hash Verification (Run After Download)

```powershell
$RECOVERY = "C:/Users/daley/Recovery/[DATE]"
Get-ChildItem -Recurse $RECOVERY -File |
  ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm MD5).Hash
    "$hash  $($_.FullName)"
  } | Out-File "$RECOVERY/MANIFEST.md5"
Write-Output "Manifest written: $RECOVERY/MANIFEST.md5"
```

---

## Activation Instructions

When Apple Cloud download is complete, open a new Claude Code session and say:

```
Apple Cloud download is complete at C:/Users/daley/Recovery/[DATE]/
Read APPLE_CLOUD_RECOVERY_AUDIT.md from the V2 package.
Fill in all STUB sections with findings from the downloaded files.
Apply privacy filter before any AgentForge ingestion.
```

Then update this file's Status from STUB to COMPLETE and remove the PENDING_EVIDENCE header.
