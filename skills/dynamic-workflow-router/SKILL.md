# AgentForge Skills Reference — Dynamic Workflow Router

---

## SKILL: Dynamic Workflow Router

**What it solves:** Prevents expensive dynamic workflow launches when a cheaper pattern (skill, subagent, or `/goal`) would suffice. Routes each task to the correct execution pattern before tokens are spent.

**Pattern:**

```typescript
// /core/orchestration/DynamicWorkflowRouter.ts

import { workflowConfig } from "../../config/workflow.config";

export interface TaskDescriptor {
  units: unknown[];          // independent work items
  hasSynthesisOutput: boolean;
  budgetRemainingUsd: number;
  userApproved: boolean;
}

export type RouteDecision =
  | "direct"       // ask Claude Code directly
  | "skill"        // invoke a saved skill
  | "subagent"     // spawn an isolated subagent
  | "goal"         // loop via /goal until done condition
  | "workflow";    // fan-out dynamic workflow

export function routeTask(task: TaskDescriptor): RouteDecision {
  const { minUnitsForWorkflow, minBudgetUsd } = workflowConfig;

  if (task.units.length < minUnitsForWorkflow) return "subagent";
  if (!task.hasSynthesisOutput) return "goal";
  if (task.budgetRemainingUsd < minBudgetUsd) return "direct";
  if (!task.userApproved) return "skill";

  return "workflow";
}
```

**Config shape** (`/config/workflow.config.json`):

```json
{
  "minUnitsForWorkflow": 5,
  "minBudgetUsd": 0.10,
  "killSwitchEvent": "WORKFLOW_KILL_REQUESTED",
  "synthesisEvent": "WORKFLOW_SYNTHESIS_READY",
  "costGateEnabled": true
}
```

**Rule:** Never emit `WORKFLOW_STARTED` without calling `routeTask()` first. If the result is not `"workflow"`, do not launch a dynamic workflow — use the returned pattern instead.

---

## Route Definitions

| Decision | When to Use | AgentForge Event |
|---|---|---|
| `direct` | One-off question, small targeted edit | No event — session only |
| `skill` | Repeatable instruction with known steps | No event — skill invocation |
| `subagent` | Isolated task, no shared state needed | `SUBAGENT_TASK_REQUESTED` |
| `goal` | Loop until done condition, unknown iteration count | `GOAL_STARTED` |
| `workflow` | 5+ independent parallel units with synthesis output | `WORKFLOW_STARTED` |

---

## Integration With EventBus

```typescript
// Register the synthesis listener before emitting WORKFLOW_STARTED
owlWatcher.on(EventType.WORKFLOW_SYNTHESIS_READY, synthesisAgent.handle.bind(synthesisAgent));

// Register kill-switch handler (required before any workflow launch)
owlWatcher.on(EventType.WORKFLOW_KILL_REQUESTED, workflowKillHandler.handle.bind(workflowKillHandler));

// Only after registration:
owlWatcher.emit(EventType.WORKFLOW_STARTED, {
  workflowId: id,
  units: task.units,
  synthesisEvent: workflowConfig.synthesisEvent,
});
```

---

*See also: `docs/analysis/claude_code_dynamic_workflows_skill_notes.md` for decision criteria.*
*See also: `hooks/session_dynamic_workflow_cost_gate.md` for pre-launch gate.*
