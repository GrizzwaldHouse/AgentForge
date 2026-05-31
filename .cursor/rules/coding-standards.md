# Coding Standards for AgentForge + BadgerHeart OS

These rules are non-negotiable and are enforced by the impeccable gate on every PR.
They mirror the non-negotiables in CLAUDE.md.

---

## 1. Observer Pattern -- No Polling

All state changes go through agentEventBus. Zero setInterval. Zero polling loops.

BAD:
```typescript
setInterval(() => {
  if (ollamaModels.length > 0) renderModels();
}, 500);
```

GOOD:
```typescript
agentEventBus.on('ollama:models:discovered', (event) => renderModels(event.models));
```

---

## 2. No Hardcoded Values

All configuration comes from `src/config/env.ts` or `projects.json`.

BAD:
```typescript
const REVENUE_TARGET = 1000;
```

GOOD:
```typescript
const REVENUE_TARGET = getEnvConfig().revenueTargetMonthlyUsd;
```

---

## 3. All Defaults in Constructors

One place for defaults. Never scattered.

BAD:
```typescript
class ChatSession {
  model?: string;
  initialize() { if (!this.model) this.model = 'llama3:8b'; }
}
```

GOOD:
```typescript
class ChatSession {
  constructor() {
    this.model = 'llama3:8b';
    this.maxTokens = 4096;
  }
}
```

---

## 4. ES Modules Only

No CommonJS require(). All imports use ESM syntax.

BAD:
```typescript
const fs = require('fs');
```

GOOD:
```typescript
import { readFileSync } from 'fs';
```

---

## 5. npm Only

Never yarn. Never pnpm.

---

## 6. Single-Line Comments -- WHY Not WHAT

```typescript
// Ollama is priority 1 in the fallback chain because it costs $0 and runs locally
const provider = routeToOllama(task);
```

---

## 7. File Headers on Every New File

```typescript
// src/components/chat-panel.tsx
// Purpose: Chatbot UI -- message input, response display, model selector
// Dependencies: agentEventBus, ModelRouter, model-selector component
// Integration points: dashboard/chat page, ollama:models:discovered event
```

---

## Project Discovery

Read `projects.json` at the AgentForge root to find all active projects.
Never hard-code paths in prompts, skills, or components.

## Task Protocol

Read the relevant HANDOFF.md in `tasks/` before starting any work.
Claim a task by creating a branch: `task/<id>-<your-agent-slug>`.
Update `assigned_to` and `status` in the HANDOFF.md frontmatter.

## PDR Documents

Read `docs/PDR/README.md` for the system architecture index.
Each PDR file has the file paths, event flows, and acceptance criteria for its subsystem.
