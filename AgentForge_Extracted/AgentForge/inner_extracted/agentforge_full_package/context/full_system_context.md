
# AgentForge Full Context

This file contains consolidated intent, architecture, and constraints.

## Core Goal
Build a revenue-generating autonomous agent system in <=10 hours using Claude Code.

## Key Systems
- HoneyBadger (modular processing engine)
- AgenticOS (event + UI system)
- Magenta OS (event coordination layer)
- LLM Router (cost control)
- Qdrant (embedding + matching)

## Design Rules
- Event-driven only
- No polling
- Config-driven
- Reuse existing repos
- Fail fast
