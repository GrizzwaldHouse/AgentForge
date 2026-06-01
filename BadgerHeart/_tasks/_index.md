# Badger Heart LLC -- Unified Task Backlog
# _tasks/_index.md
# Last updated: 2026-06-01
# Source: docs/superpowers/specs/2026-06-01-unified-tasks-backlog-design.md

---

## Pinned Flags (unresolved -- surface every session)

- EAA back-pay outstanding: approx $2,400-2,800 online subsistence rate (38 CFR 21.268). Never cite $6,878.
- July 2026 military childcare eligibility deadline: hard cutoff.
- Padilla Privacy Act consent page 4: signed and returned? Verify. (see TASK-0003)
- Written-denial demand to Antwon.German@va.gov (38 CFR 21.257): sent? Verify. (see TASK-0002)

---

## Task Summary

| Status | Count |
|---|---|
| pending | 25 |
| in-progress | 0 |
| review | 0 |
| done | 0 |

| Domain | Count |
|---|---|
| VRE | 3 |
| LLC | 6 |
| MESHY | 8 |
| BLENDER | 2 |
| UPWORK | 1 |
| VETASSIST | 1 |
| cross-store-admin | 4 |

---

## Ranked Backlog

| ID | Priority | Domain | Deadline | Title | Status |
|---|---|---|---|---|---|
| TASK-0001 | P1 | VRE | 2026-06-02 | Sign Operating Agreement | pending |
| TASK-0005 | P1 | LLC | 2026-06-01 | Set up Gumroad store and connect Mercury ACH | pending |
| TASK-0004 | P1 | LLC | 2026-06-01 | Publish UE5 C++ Debugging Field Guide on Gumroad | pending |
| TASK-0002 | P1 | VRE | 2026-07-31 | Send written-denial demand to Antwon.German@va.gov | pending |
| TASK-0003 | P1 | VRE | 2026-07-31 | Confirm Padilla Privacy Act consent page 4 signed | pending |
| TASK-0006 | P1 | MESHY | 2026-07-14 | Submit Elemental Progression Combat Kit to Fab | pending |
| TASK-0013 | P2 | LLC | 2026-06-15 | Q2 federal estimated tax payment (SE 15.3%) | pending |
| TASK-0008 | P2 | MESHY | 2026-06-01 | Generate first Meshy prompt batch (5 asset types) | pending |
| TASK-0009 | P2 | MESHY | 2026-06-01 | Set up Meshy credit tracker component | pending |
| TASK-0007 | P2 | MESHY | 2026-06-07 | Ship Gumroad tutorial pack: Blender cleanup workflow | pending |
| TASK-0010 | P2 | MESHY | 2026-06-07 | Document Meshy-to-Blender import and cleanup checklist | pending |
| TASK-0015 | P2 | MESHY | 2026-06-14 | Export first approved Meshy batch to Blender | pending |
| TASK-0011 | P2 | BLENDER | null | Sloth audit: verify decimate and Mixamo prep reports | pending |
| TASK-0012 | P2 | LLC | null | Order Certificate of Status from CA SOS ($5) | pending |
| TASK-0014 | P2 | LLC | null | Draft listing copy and gallery briefs for all 7 products | pending |
| TASK-0016 | P3 | BLENDER | null | Scaffold Todoist sections under Blender Workshop project | pending |
| TASK-0017 | P3 | UPWORK | null | Scaffold Todoist sections under Upwork Pipeline project | pending |
| TASK-0018 | P3 | VETASSIST | null | Scaffold Todoist sections under VetAssist project | pending |
| TASK-0019 | P3 | LLC | null | Confirm Mercury business account status | pending |
| TASK-0020 | P3 | LLC | 2026-08-14 | File LLC-12 Statement of Information | pending |
| TASK-0021 | P3 | cross-store-admin | null | Standup agent rollout: adopt v2.1.0 config | pending |
| TASK-0022 | P3 | cross-store-admin | null | Reference migration wave: lock canonical destinations | pending |
| TASK-0024 | P4 | MESHY | 2026-06-21 | Second Meshy prompt batch refined from batch 1 | pending |
| TASK-0023 | P4 | MESHY | 2026-06-28 | Package sci-fi industrial bundle (15 assets) for Fab | pending |
| TASK-0025 | P4 | MESHY | 2026-07-14 | Meshy to Fab pipeline v1 live with first paid listing | pending |

---

## How Agents Use This File

1. Open _index.md and read the top of the Ranked Backlog table.
2. Open the HANDOFF.md for the first pending task with no blocking depends_on.
3. Check the depends_on list. If any task is not done, skip and take the next.
4. Claim by setting status: in-progress and assigned_to in the frontmatter.
5. Update _index.md status column on every status change.
6. On done: set status: done, flip acceptance_criteria_met and impeccable_test_pass
   to true, and record reviewer sign-off in Review Notes.
