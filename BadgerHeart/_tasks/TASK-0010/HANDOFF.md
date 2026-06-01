---
task_id: TASK-0010
title: "Document Meshy-to-Blender import and cleanup checklist"
status: pending
assigned_to: ""
project: badgerheart
branch: ""
pr_url: ""
depends_on: []
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "echo no automated test - human verification required"
created: 2026-06-01
updated: 2026-06-01
domain: MESHY
lane: meshy
priority: P2
deadline: 2026-06-07
---

# HANDOFF Contract

## Context

Linear issue BAD-19. The 8-step pipeline is documented in MONTHLY_TRACKER.md
but needs a standalone repeatable checklist agents and Marcus can use
session-to-session without reading the full tracker doc.

## Acceptance Criteria

- [ ] Standalone checklist document written at BadgerHeart/BlenderWorkshop/CLEANUP_CHECKLIST.md
- [ ] All 8 steps covered with exact Blender settings (thresholds, ratios, scale, export flags)
- [ ] Blender version noted (5.1.2 primary, 4.5.10 LTS fallback)
- [ ] ArmorPaint note included for simple closed-surface objects
- [ ] Linear issue BAD-19 updated with checklist path

## Dependencies

None.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Export settings to document:
FBX: Scale 1.0, Forward -Z, Up Y, Apply Transform ON, Embed Textures OFF, Add Leaf Bones OFF
GLB: Draco OFF, Apply Modifiers ON

## Review Notes

_Populated by reviewer on completion._
