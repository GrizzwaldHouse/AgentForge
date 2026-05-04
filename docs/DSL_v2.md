# DSL v2 Schema

```json
{
  "version": "2.0",
  "states": {
    "idle": {
      "on": {
        "agent.executed": {
          "target": "running",
          "guards": ["isValid"],
          "actions": ["log", "persist"]
        }
      }
    },
    "running": {
      "parallel": true,
      "on": {
        "agent.executed.failed": {
          "target": "error",
          "actions": ["alert"]
        }
      }
    }
  }
}
```
