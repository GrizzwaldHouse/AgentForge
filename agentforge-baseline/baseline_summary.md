# AgentForge Baseline Summary
Generated: 2026-05-03 21:49:29

## File Counts

| Source | Files Indexed |
|--------|--------------|
| AgentForge/ (canonical artifacts) | 32 |
| agentforge_autonomous/src/ (TypeScript impl) | 128 |
| **Total** | **160** |

### By Category
| Category | Count |
|----------|-------|
| CODE (.ts/.tsx) | 135 |
| ARCHITECTURE (.md arch/seq) | 12 |
| CONFIG (.json/.yaml) | 3 |
| SCHEMA | 0 |
| PRD | 4 |
| PROMPT | 2 |
| UNKNOWN | 4 |

## Completeness by Organ

Overall: **88%**

| Organ | Status | Files | Notes |
|-------|--------|-------|-------|
| Heart              | PARTIAL  |     8 files | 5 stub/placeholder files out of 6 TS files |
| Nervous_System     | EXISTS   |     8 files | 8 total files, 8 TypeScript |
| Brain              | EXISTS   |     6 files | 6 total files, 5 TypeScript |
| Muscles            | EXISTS   |     9 files | 9 total files, 7 TypeScript |
| Skin               | EXISTS   |     8 files | 8 total files, 8 TypeScript |
| Endocrine          | EXISTS   |     3 files | 3 total files, 3 TypeScript |
| Skeletal           | EXISTS   |     9 files | 9 total files, 6 TypeScript |
| Lymphatic          | EXISTS   |     9 files | 9 total files, 9 TypeScript |

## Top 3 Inconsistencies

1. [HIGH] MULTIPLE_PRD_VERSIONS: 4 PRD files found — no single source of truth
2. [MEDIUM] CROSS_SOURCE_CONFLICT: File 'index.ts' exists in both AgentForge/ and agentforge_autonomous/src/

## Top 3 Gaps

1. Heart (PARTIAL): 5 stub/placeholder files out of 6 TS files

## Architecture Patterns Detected

- polling (confidence: HIGH, 13 files)
- REST-api (confidence: HIGH, 12 files)
- SSE (confidence: HIGH, 1 files)
- modular (confidence: MEDIUM, 19 files)

## Entry Points

- Total entry points found: 43
- API routes: 12
- Orchestrators: 4
- Agents: 16
- Services: 5
- Runtime (AgentForge/): 6

## Event Flows

- Total event flow signals: 25
- Transports detected: SSE, in-memory, polling

## Key Findings (Zero Speculation)

1. SOURCE_A (AgentForge/) contains 32 files across 7 directories.
2. SOURCE_B (agentforge_autonomous/src/) contains 128 files.
3. 100 TypeScript interfaces found; 0 have duplicate definitions.
4. 1 filenames appear in both sources (index.ts).
5. Violations detected: 0 (CommonJS usage, etc.).
