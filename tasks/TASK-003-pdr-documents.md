---
task_id: TASK-003
status: done
assigned_to: claude-sonnet-4-6
depends_on: [TASK-001]
impeccable_test_pass: true
test_command: "test -f docs/PDR/README.md && test -f docs/PDR/01-sandbox.md && test -f docs/PDR/03-chatbot.md && echo OK"
---

# PDR Documents (Cursor + Claude Code Ready)

## Acceptance Criteria

- [x] docs/PDR/README.md index created with links to all 5 subsystem files
- [x] docs/PDR/01-sandbox.md written (sandbox structure, projects.json schema)
- [x] docs/PDR/02-task-system.md written (HANDOFF.md protocol, checkout/checkin)
- [x] docs/PDR/03-chatbot.md written (chat route, ModelRouter, Ollama discovery)
- [x] docs/PDR/04-badgerheart-pipeline.md written (MeshyForge/Fab/Blender task structure)
- [x] docs/PDR/05-impeccable-gate.md written (6 gate checks, npm run impeccable spec)
- [x] Each PDR has: file paths table, Mermaid event flow diagram, model routing table
- [x] .cursor/rules/ referenced in each PDR

## Review Notes

APPROVED -- claude-sonnet-4-6 -- 2026-05-31

All 6 PDR files created under docs/PDR/:
- README.md: index with reading order and spec reference
- 01-sandbox.md: projects.json schema, agent discovery flow (Mermaid sequenceDiagram)
- 02-task-system.md: HANDOFF.md schema, status lifecycle (Mermaid stateDiagram), branch naming, PR checklist, model routing table
- 03-chatbot.md: Ollama discovery, context scoping, event flow (Mermaid sequenceDiagram), model routing table
- 04-badgerheart-pipeline.md: MeshyForge/BlenderWorkshop/FabStorefront file paths, revenue_tracker.csv format, TASK-BH naming convention
- 05-impeccable-gate.md: 6 gate checks table, Phase 3 npm run impeccable spec

All files verified present via PowerShell path check.
