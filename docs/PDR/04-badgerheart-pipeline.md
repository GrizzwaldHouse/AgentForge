# PDR 04 -- BadgerHeart LLC Asset Pipeline

## Purpose

Defines how MeshyForge, BlenderWorkshop, and FabStorefront tasks integrate into the unified AgentForge task system.

## Key Files

| File | Path | Responsibility |
|------|------|---------------|
| MeshyForge tasks | `C:\Users\daley\Projects\BadgerHeart\MeshyForge\tasks\` | 3D generation queue |
| BlenderWorkshop tasks | `C:\Users\daley\Projects\BadgerHeart\BlenderWorkshop\tasks\` | Cleanup/export queue |
| FabStorefront tasks | `C:\Users\daley\Projects\BadgerHeart\FabStorefront\tasks\` | Listing queue |
| Revenue tracker | `C:\Users\daley\Projects\BadgerHeart\FabStorefront\revenue_tracker.csv` | Monthly sales data |
| Revenue API | `src/app/api/badgerheart/revenue/route.ts` | Serves CSV as JSON |
| Revenue widget | `src/components/revenue-tracker-widget.tsx` | Dashboard display |

## revenue_tracker.csv Format

```csv
Month,Listing,Units Sold,Revenue USD,Platform Cut,Net USD,Notes
2026-05,GHObjectPool,3,59.97,7.20,52.77,first sales
```

## Revenue Widget Behavior

- Reads from `/api/badgerheart/revenue` on mount
- Emits `badgerheart:revenue:updated` via `agentEventBus` when data loads
- Shows current month net revenue vs $1,000 target as a progress bar
- Shows top listing this month by net revenue
- Shows "No data" state gracefully when CSV is empty or missing
- Revenue target ($1,000) comes from `getEnvConfig().revenueTargetMonthlyUsd` -- not hardcoded

## HANDOFF.md Naming for BadgerHeart Tasks

```
TASK-BH-NNN-description.md

Examples:
  TASK-BH-001-batch-scifi-props.md      (MeshyForge)
  TASK-BH-010-cleanup-raven-mage.md     (BlenderWorkshop)
  TASK-BH-020-list-elemental-kit.md     (FabStorefront)
```
