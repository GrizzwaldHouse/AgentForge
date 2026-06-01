---
task_id: TASK-0014
title: "Draft listing copy and gallery briefs for all 7 products"
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
domain: LLC
lane: cross-store-admin
priority: P2
deadline: null
---

# HANDOFF Contract

## Context

GrizzwaldHouse product upload prep session work. Listing copy and gallery
briefs are not yet drafted for any product. Full task spec in session prompt
at C:\Users\daley\Projects\BadgerHeartOps\docs\Standup\.

Products requiring listing copy:
1. Sci-Fi Industrial Props Vol1 ($24.99, Fab + itch.io, AI disclosure required)
2. Fantasy Weapons Pack ($19.99, Fab + itch.io, AI disclosure required)
3. Sci-Fi Environment Kit ($19.99, Fab + itch.io, AI disclosure required)
4. GHObjectPool ($19.99, Fab + Gumroad, no disclosure)
5. GHStaminaCore ($14.99, Gumroad only -- Fab hold pending bundle strategy)
6. Elemental Progression Combat Kit ($59.99, Fab + Gumroad, NEVER bundle)
7. UE5 C++ Debugging Field Guide ($25.00, Gumroad, publish immediately)

## Acceptance Criteria

- [ ] Fab title written per product (30 char hard limit)
- [ ] Fab short description written per product
- [ ] Fab tags selected from approved taxonomy per product
- [ ] Gumroad long description written per product (SEO-optimized)
- [ ] itch.io page copy written per product (casual developer tone)
- [ ] AI disclosure text written for products 1, 2, and 3
- [ ] Gallery image briefs written for products 1, 2, and 3 (1920x1080, under 3MB)
- [ ] Bundle strategy document produced
- [ ] All outputs saved to GumroadStore/GumroadReference/LISTINGS/

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

Hard rules for listing copy:
- No em dashes anywhere
- No fake urgency language
- No unverified superlatives
- Fab title 30 char hard limit
- Gallery images: recreated from scratch, no real UE5 editor screenshots (EULA)
- AI disclosure mandatory on Fab and itch.io for Meshy-geometry assets
- Elemental Kit: NEVER bundle, $59.99 standalone anchor only
- GHStaminaCore: do not launch solo on Fab without bundle shelter

Approved Fab tags: SciFi, Industrial, Cyberpunk, Modular, PBR, TexturePacked,
Stylized, Lowpoly, Realistic, Blueprint, Niagara, Nanite, EpicSkeleton, ControlRig, Gameplay

## Review Notes

_Populated by reviewer on completion._
