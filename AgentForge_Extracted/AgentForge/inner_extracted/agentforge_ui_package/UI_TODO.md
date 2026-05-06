
# AgentForge UI TODO + Integration Plan

## Phase 1 — UI Foundation
- Create /ui module (separate from core)
- Setup React + Tailwind
- Define layout shell (sidebar + topbar)
- Implement theme (Hufflepuff engineering style)

## Phase 2 — Core Screens
### Dashboard
- Job stats
- Agent activity feed
- Earnings tracker

### Jobs
- Job cards
- Match score display
- Filters

### Proposals
- Proposal list
- Edit + approve view

### Agents
- HoneyBadger module states
- Bob Companion summary
- Agent Alexander status

### Automation
- Pipeline logs
- Event stream

## Phase 3 — Event Integration
- Connect UI to event bus
- Render events:
  - JOB_FETCHED
  - JOB_MATCHED
  - PROPOSAL_CREATED
- No polling (event-driven only)

## Phase 4 — Agent Binding
- Create adapter layer:
  UI ↔ Event Bus ↔ Agents

- Map:
  HoneyBadger → processing status
  Router → model usage
  Qdrant → match scores

## Phase 5 — Analytics
- Conversion metrics
- Cost tracking
- Model usage

## Phase 6 — Claude Code Instructions
Claude must:
1. Scan existing repo
2. Identify:
   - OwlWatcher hooks
   - AgenticOS connections
   - existing UI (if any)
3. Compare against this TODO
4. Generate:
   - gap analysis
   - integration plan
   - phased implementation

## Constraints
- No modification of core logic
- UI must be modular
- Event-driven only
- Config-driven rendering

## Deliverables
- /ui folder
- component system
- event adapters
- dashboard implementation

