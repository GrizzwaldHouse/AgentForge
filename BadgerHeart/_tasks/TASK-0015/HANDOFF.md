---
task_id: TASK-0015
title: "Export first approved Meshy batch to Blender"
status: pending
assigned_to: ""
project: badgerheart
branch: ""
pr_url: ""
depends_on: ["TASK-0008"]
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "python C:\\Users\\daley\\Projects\\BadgerHeart\\BlenderWorkshop\\scripts\\verify_decimate_report.py"
created: 2026-06-01
updated: 2026-06-01
domain: MESHY
lane: meshy
priority: P2
deadline: 2026-06-14
---

# HANDOFF Contract

## Context

Linear issue BAD-21. Depends on TASK-0008 (first prompt batch complete).
Run the standard 8-step Blender cleanup pipeline on each exported asset.

## Acceptance Criteria

- [ ] All assets from TASK-0008 batch imported into Blender
- [ ] Standard 8-step cleanup applied to each asset
- [ ] verify_decimate_report.py passes (PASS, all assets under 28.5 MB)
- [ ] FBX and GLB exports completed for each asset
- [ ] Asset inventory updated in MONTHLY_TRACKER.md
- [ ] Linear issue BAD-21 updated

## Dependencies

TASK-0008 must reach done before this task may start.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command: verify_decimate_report.py exits 0)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Cleanup checklist will be at BadgerHeart/BlenderWorkshop/CLEANUP_CHECKLIST.md
once TASK-0010 is done. Use MONTHLY_TRACKER.md pipeline steps until then.

## Review Notes

_Populated by reviewer on completion._
