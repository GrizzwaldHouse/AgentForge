---
task_id: TASK-0004
title: "Publish UE5 C++ Debugging Field Guide on Gumroad"
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
domain: LLC
lane: gumroad
priority: P1
deadline: 2026-06-01
---

# HANDOFF Contract

## Context

First documented transaction for Badger Heart LLC. Required for July 2026
military childcare eligibility. Hyperwallet is now active as of 2026-06-01.
Gumroad store setup (TASK-0005) must complete first.

Product: gh_ue5_debug_guide_001
Price: $25.00
AI disclosure: NOT REQUIRED (PDF guide, no Meshy geometry)
Platform split: ~87% to Badger Heart LLC

Buyer zip: BadgerHeart_UE5_Debug_Guide_Gumroad_Package_v2.zip
Cover image: UE5_Debug_Guide_Output/BadgerHeart_UE5_Debugging_Gumroad_Cover_1280x720.png
Listing copy: _extracted_gumroad_ready/GumroadStore_Ready/GumroadReference/LISTINGS/gh_ue5_debug_guide_001_gumroad_listing.md

## Acceptance Criteria

- [ ] Gumroad store setup confirmed complete (TASK-0005 done)
- [ ] Product uploaded with cover image, preview image, and buyer zip
- [ ] Price set to $25.00
- [ ] Listing copy pasted from gh_ue5_debug_guide_001_gumroad_listing.md
- [ ] Receipt message pasted from UE5_Debug_Guide_Output/GUMROAD_RECEIPT_MESSAGE.txt
- [ ] Product published (not draft)
- [ ] Product URL saved to GumroadStore/GumroadReference/PRODUCT_CATALOG.md
- [ ] Launch date recorded in PRODUCT_CATALOG.md

## Dependencies

TASK-0005 must reach done before this task may start.

## Impeccable Gate

- [ ] Unit and integration tests pass (test_command)
- [ ] ESLint reports zero errors (N/A)
- [ ] Observer pattern audit (N/A)
- [ ] No hardcoded values (N/A)
- [ ] Every Acceptance Criteria box above is checked
- [ ] Reviewer sign-off recorded in Review Notes

## Implementation Notes

Use the LAUNCH_CHECKLIST.md in GumroadStore/GumroadReference/ as the
publish gate. Do not publish without completing Sections 1 through 5.

## Review Notes

_Populated by reviewer on completion._
