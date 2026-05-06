
# AgentForge UI MVP (Full System Plan)

## Phase 1 — UI Foundation (2–3 hrs)
- Setup React + Vite + Tailwind
- Create /ui folder (separate from core)
- Setup layout shell:
  - Sidebar navigation
  - Top bar (status, cost meter)
- Add theme system (gold/charcoal)

## Phase 2 — Core Screens (3–4 hrs)
- Dashboard (metrics + agent feed)
- Jobs page (cards + match score)
- Proposals page (list + editor)
- Agents page (HoneyBadger modules view)

## Phase 3 — Event Binding (2 hrs)
- Create event adapter (WebSocket or local bridge)
- Subscribe to:
  JOBS_FETCHED
  JOB_MATCHED
  PROPOSAL_CREATED
- Render live updates

## Phase 4 — Agent Integration (2 hrs)
- Show:
  HoneyBadger status
  Router decisions
  Cost tracking
- Display pipeline progress

## Phase 5 — 3D Layer (optional)
- Background canvas (Three.js)
- Inject generated 3D assets
- Keep lightweight

## Phase 6 — Polish (1 hr)
- Animations (subtle)
- Loading states
- Error UI
