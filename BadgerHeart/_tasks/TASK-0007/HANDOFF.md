---
task_id: TASK-0007
title: "Ship Gumroad tutorial pack: Blender cleanup workflow"
status: pending
assigned_to: ""
project: badgerheart
branch: ""
pr_url: ""
depends_on: ["TASK-0005"]
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "echo no automated test - human verification required"
created: 2026-06-01
updated: 2026-06-01
domain: MESHY
lane: gumroad
priority: P2
deadline: 2026-06-07
---

# HANDOFF Contract

## Context

Linear issue BAD-20. Zero Meshy credit cost -- this is a documentation product
covering the existing Blender cleanup pipeline. The 8-step cleanup workflow is
documented in BadgerHeartOps/revenue/MONTHLY_TRACKER.md under "Blender cleanup
pipeline (standard, all assets)".

## Acceptance Criteria

- [ ] Tutorial pack document written covering all 8 cleanup steps
- [ ] Document packaged as PDF or zip
- [ ] Gumroad listing created with price between $9 and $19
- [ ] Product published on Gumroad
- [ ] Linear issue BAD-20 updated with completion note

## Dependencies

TASK-0005 (Gumroad store setup) must be done.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

The 8-step pipeline from MONTHLY_TRACKER.md:
1. Import GLB
2. Apply all transforms (Ctrl+A)
3. Merge by distance (0.0001 threshold)
4. Recalculate normals outside
5. Decimate 2x at 0.4 ratio (84% reduction total)
6. Set origin to bottom-center
7. Rename: SM_AssetName_01
8. Export FBX and GLB with documented settings

Blender version: 5.1.2 current stable. LTS fallback: 4.5.10.

## Review Notes

_Populated by reviewer on completion._
