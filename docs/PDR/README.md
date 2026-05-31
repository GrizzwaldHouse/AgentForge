# AgentForge + BadgerHeart OS -- PDR Index

Project Design Records for the unified agent operating system.
These are the authoritative source for all subsystem architecture decisions.

| Subsystem | File | Status |
|-----------|------|--------|
| Sandbox and project registry | [01-sandbox.md](01-sandbox.md) | Current |
| Task system (HANDOFF.md protocol) | [02-task-system.md](02-task-system.md) | Current |
| Chatbot and model routing | [03-chatbot.md](03-chatbot.md) | Current |
| BadgerHeart pipeline integration | [04-badgerheart-pipeline.md](04-badgerheart-pipeline.md) | Current |
| Impeccable quality gate | [05-impeccable-gate.md](05-impeccable-gate.md) | Current |

## Reading Order for New Agents

1. Read this index
2. Read `projects.json` at the repo root to discover all projects
3. Read the PDR for the subsystem you are working in
4. Read the relevant HANDOFF.md in `tasks/` to claim your task
5. Read `.cursor/rules/coding-standards.md` for non-negotiable rules

## Spec Reference

Full locked decisions: `docs/superpowers/specs/2026-05-31-agentforge-badgerheart-os-design.md`
