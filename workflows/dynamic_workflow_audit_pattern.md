# AgentForge Workflows — Dynamic Audit Pattern

---

## WORKFLOW: Dynamic Audit Pattern

**Trigger:** `AUDIT_REQUESTED` event — emitted when a wide codebase or system audit is needed across many independent targets

**Best for:**
- Skill library audits (each skill is an independent unit)
- Large codebase migration scans (each file or module is a unit)
- Multi-file consistency checks
- Research with independent source verification
- Parallel product listing audits
- AgentForge ecosystem health checks across multiple repos

**Not for:**
- Small edits (fewer than 5 units)
- Vague or unscoped planning
- Single-file fixes
- Tasks where every step depends on the previous one
- Anything that lacks a defined synthesis output

---

**Event sequence:**

```
AUDIT_REQUESTED
  └── A-ROUTER Dynamic Workflow Router
        Loads target list from event payload
        Calls routeTask() from /core/orchestration/DynamicWorkflowRouter.ts
        Checks cost gate (costGateEnabled from workflow.config.json)
        Checks remaining daily budget
        If approved:
          └── Emits: WORKFLOW_APPROVED
        If blocked:
          └── Emits: WORKFLOW_BLOCKED (includes recommended alternative)

WORKFLOW_APPROVED
  └── A-ORCHESTRATOR Supervisor Orchestrator
        Registers kill-switch handler: WORKFLOW_KILL_REQUESTED
        Registers synthesis handler: WORKFLOW_SYNTHESIS_READY
        Splits target list into independent work units
        For each unit:
          └── Emits: AUDIT_UNIT_REQUESTED (payload: unitId, target, auditSpec)

AUDIT_UNIT_REQUESTED  [N parallel instances, one per unit]
  └── A-AUDITOR Audit Agent (one instance per unit)
        Reads target (file, repo, skill, record)
        Applies audit spec from event payload
        Does NOT call other agents directly
        Produces audit result object
        └── Emits: AUDIT_UNIT_COMPLETED (payload: unitId, result, violations[])

AUDIT_UNIT_COMPLETED  [collected by orchestrator]
  └── A-ORCHESTRATOR (tracking completion count)
        Increments completed counter
        When all units complete:
          └── Emits: WORKFLOW_SYNTHESIS_READY (payload: allResults[])

WORKFLOW_SYNTHESIS_READY
  └── A-SYNTHESIZER Synthesis Agent
        Aggregates all unit results
        Deduplicates violations
        Scores overall compliance
        Generates final audit report
        Stores to /output/audits/{date}/{auditId}.md
        └── Emits: AUDIT_COMPLETE (payload: reportPath, summary)

AUDIT_COMPLETE
  └── Delivers report to caller via configured channel
      Updates audit_result.json in .agentforge/
      Logs to observability layer
```

---

**Failure handling:**

```
AGENT_ERROR (from any AUDIT_UNIT)
  └── A5 Token Optimizer / Error Handler
        Logs unit failure with unitId
        Marks unit as FAILED in orchestrator tracking
        Does not block remaining units
        Includes FAILED units in synthesis with error status

WORKFLOW_KILL_REQUESTED
  └── A-ORCHESTRATOR
        Stops emitting new AUDIT_UNIT_REQUESTED events
        Waits for in-flight units to complete
        Emits: WORKFLOW_SYNTHESIS_READY with partial results
        Marks report as PARTIAL_AUDIT
```

---

**Config shape** (`/config/workflow.config.json`):

```json
{
  "minUnitsForWorkflow": 5,
  "minBudgetUsd": 0.10,
  "killSwitchEvent": "WORKFLOW_KILL_REQUESTED",
  "synthesisEvent": "WORKFLOW_SYNTHESIS_READY",
  "costGateEnabled": true,
  "auditOutputDir": "/output/audits"
}
```

---

*Aligns with AgentForge non-negotiables: event-driven only, no polling, no direct agent calls, config-driven, kill switch required.*
*See also: `skills/dynamic-workflow-router/SKILL.md` for routing logic.*
*See also: `hooks/session_dynamic_workflow_cost_gate.md` for cost gate spec.*
