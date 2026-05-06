# AgentForge PRD v3

## Overview
AgentForge is a modular AI operating system built on a biomechanical architecture model. It provides a control-plane UI for orchestrating multi-agent workflows using an event-driven system.

## Core Principles
- Event-driven only (no polling)
- Config-driven orchestration
- Separation of concerns
- Modular and portable
- Fully observable

## Architecture
Heart: Orchestrator (DSL state machine)  
Nervous System: Event Bus  
Brain: Knowledge Graph  
Muscles: Execution (n8n + Playwright)  
Skin: Validation + Auth  
Endocrine: Config  
Skeletal: Contracts  
Lymphatic: Observability  

## API Contracts
### Base Event
id, type, timestamp, source, payload

### Command Event
type: command.execute  
payload: action + params

## Data Flow
Event → Orchestrator → Execution → Event Store → UI

## Observability
- Metrics
- Tracing
- Logs

## Security
- JWT
- RBAC

## Deployment
- Desktop (Tauri)
- Web (Next.js)
- Mobile (PWA)

## Roadmap
Phase 1 → Core  
Phase 2 → Execution  
Phase 3 → Observability  
Phase 4 → Upgrade Engine  
Phase 5 → Installer
