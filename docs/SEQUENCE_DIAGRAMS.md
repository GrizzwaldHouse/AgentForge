# Sequence Diagrams

## Event Flow
User → UI → EventBus → Orchestrator → EventBus → UI + Store

## Execution Flow
Event → Orchestrator → Execution → Result Event → Store → UI
