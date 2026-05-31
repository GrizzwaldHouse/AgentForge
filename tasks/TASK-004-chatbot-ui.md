---
task_id: TASK-004
status: pending
assigned_to: ""
depends_on: [TASK-001]
impeccable_test_pass: false
test_command: "npm run build 2>&1 | tail -5"
---

# Chatbot UI in AgentForge Dashboard

## Acceptance Criteria

- [ ] src/app/dashboard/chat/page.tsx created and builds without error
- [ ] src/components/chat-panel.tsx renders message input + response display
- [ ] src/components/model-selector.tsx auto-populates from Ollama API (http://localhost:11434/api/tags)
- [ ] ollama:models:discovered event emitted via agentEventBus on load
- [ ] ollama:models:offline status shown gracefully when Ollama is unreachable
- [ ] chat:message:sent and chat:message:received events emitted on each exchange
- [ ] Context sent to model = project CLAUDE.md + current task HANDOFF.md (no more)
- [ ] No setInterval, no polling — observer pattern only

## Review Notes
