# Orchestrator DSL Schema v1.0

## Overview
Defines state transitions and actions for AgentForge orchestrator.

## Schema
```json
{
  "version": "1.0",
  "states": {
    "<state_name>": {
      "on": {
        "<event_type>": {
          "target": "<next_state>",
          "actions": ["<action_name>"]
        }
      }
    }
  }
}
```

## Example
```json
{
  "version": "1.0",
  "states": {
    "idle": {
      "on": {
        "agent.executed": {
          "target": "running",
          "actions": ["log", "persist"]
        }
      }
    }
  }
}
```

## Rules
- States must be predefined
- Events must match contract types
- Actions must be registered handlers
- No side effects outside event system

## Versioning
- Increment version on schema changes
- Maintain backward compatibility
- Validate schema at runtime

## Extensibility
- Add guards (conditions)
- Add async actions
- Support parallel states (future)
