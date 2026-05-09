# AgentForge Architecture Decision

**Date:** 2026-05-03  
**Decision By:** Marcus Daley  
**Status:** CONFIRMED

## Decision: Flat Per-Repo Structure (Option A)

AgentForge uses a flat per-repo architecture where each GrizzwaldHouse repo is an independent
component that plugs into AgentForge as a first-class organ. There is NO monorepo.

## Evidence

The agentforge_control.py CONFIG (created 2026-05-03) explicitly defines:

```python
"repos_root": r"C:\Users\daley\Projects",
"target_repos": [
    "AgentForge",       # The control plane
    "cowork-skills",
    "BrightForge",
    "portfolio-website",
    "StructuredLogging",
    "Bob-AICompanion",
    "VetAssist",
    "grizz-optimizer",
]
```

## What This Means

- C:\Users\daley\Projects\AgentForge\ is the control plane (this repo)
- It contains the Next.js dashboard, orchestrator, event bus, safety layer
- Other repos expose capabilities via AgentForge event contracts
- agentforge-spec/contracts/ TypeScript types define the shared event schema
- NO shared packages/ workspace

## Rejected Options

- Monorepo (pnpm workspace) — too much coordination overhead for 10-15 hrs/week
- Hybrid packages — adds build complexity without clear benefit at current scale

## Discarded Artifacts

Zip bundles evaluated and discarded (stubs/placeholders):
- agentforge_ultimate — Tauri installer stub
- agentforge_ingestion_pack — 1-line placeholder files  
- agentforge_ui_full/ui_package — Near-empty JSX stubs
- agentforge_full_package — Architecture docs with placeholder sections
