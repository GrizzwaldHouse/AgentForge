---
task_id: TASK-003
status: pending
assigned_to: ""
depends_on: [TASK-001]
impeccable_test_pass: false
test_command: "test -f docs/PDR/README.md && test -f docs/PDR/01-sandbox.md && test -f docs/PDR/03-chatbot.md && echo OK"
---

# PDR Documents (Cursor + Claude Code Ready)

## Acceptance Criteria

- [ ] docs/PDR/README.md index created with links to all 5 subsystem files
- [ ] docs/PDR/01-sandbox.md written (sandbox structure, projects.json schema)
- [ ] docs/PDR/02-task-system.md written (HANDOFF.md protocol, checkout/checkin)
- [ ] docs/PDR/03-chatbot.md written (chat route, ModelRouter, Ollama discovery)
- [ ] docs/PDR/04-badgerheart-pipeline.md written (MeshyForge/Fab/Blender task structure)
- [ ] docs/PDR/05-impeccable-gate.md written (6 gate checks, npm run impeccable spec)
- [ ] Each PDR has: file paths table, Mermaid event flow diagram, model routing table
- [ ] .cursor/rules/ referenced in each PDR

## Review Notes
