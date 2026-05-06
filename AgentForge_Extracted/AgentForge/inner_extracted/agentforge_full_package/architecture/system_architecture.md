
# Architecture

## Layers
1. Ingestion
2. Processing (HoneyBadger modules)
3. Routing (LLM router)
4. Output (proposals, logs)

## Patterns
- Observer
- Strategy
- Pipeline
- Adapter

## Event Flow
JOB_FETCH → JOB_PARSE → MATCH → PROPOSAL → OUTPUT
