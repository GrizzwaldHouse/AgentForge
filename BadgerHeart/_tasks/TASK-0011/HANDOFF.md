---
task_id: TASK-0011
title: "Sloth audit: verify decimate and Mixamo prep reports; confirm no em dashes in scripts"
status: pending
assigned_to: "Sloth"
project: badgerheart
branch: ""
pr_url: ""
depends_on: []
acceptance_criteria_met: false
impeccable_test_pass: false
test_command: "python C:\\Users\\daley\\Projects\\BadgerHeart\\BlenderWorkshop\\scripts\\verify_decimate_report.py"
created: 2026-06-01
updated: 2026-06-01
domain: BLENDER
lane: blender
priority: P2
deadline: null
---

# HANDOFF Contract

## Context

Bear completed script upgrades and Blender batch. Verifier returned PASS 6/6.
Sloth must audit output quality before Marcus uploads to Mixamo. This is a
read-only verification task -- no implementation changes.

Project root: C:\Users\daley\Projects\BadgerHeart\BlenderWorkshop

## Acceptance Criteria

- [ ] decimate_report.json values verified against actual disk file sizes
- [ ] mixamo_prep_report.json shows pass:6 fail:0 mesh_count_after:1 armature_count_before:0
- [ ] Both borderline assets under 28.5 MB on disk confirmed
- [ ] FBX counterparts exist in output_fbx/
- [ ] No em dashes in batch_decimate_mixamo.py or batch_prep_mixamo.py
- [ ] No hardcoded C:\ paths outside CONFIG block in either script
- [ ] Findings written to docs/agents/agent_report.md

## Dependencies

None. Bear's work is complete.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command: verify_decimate_report.py exits 0)
- [ ] ESLint reports zero errors (N/A -- Python)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values: confirm scripts use CONFIG block only
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Do not touch: scripts/batch_cleanup.py, batch_export_fbx.py, batch_export_glb.py,
or input_glb/ (raw Meshy originals -- read-only archive).

If Mixamo upload fails later: reduce safe_limit_mb in CONFIG to 25.0 and rerun.

## Review Notes

_Populated by reviewer on completion._
