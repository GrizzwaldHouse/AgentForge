# Archive Directory

This directory contains files that have been superseded by newer implementations.

## Archived Files

### AgentOrchestrator.ts.bak
- **Archived:** 2026-04-06
- **Original Location:** `src/backend/services/AgentOrchestrator.ts`
- **Size:** 16 lines
- **Reason:** Superseded by `ObservableOrchestrator.ts` (260 lines) which adds event emission and execution backend support
- **Status:** No imports found in codebase - safe to archive

### AgentOrchestrator-duplicate.ts.bak
- **Archived:** 2026-04-06
- **Original Location:** `backend/services/AgentOrchestrator.ts`
- **Reason:** Duplicate of the above file from legacy `backend/` directory structure
- **Status:** No imports found in codebase - safe to archive

### ModelService-duplicate.ts.bak
- **Archived:** 2026-04-06
- **Original Location:** `backend/services/ModelService.ts`
- **Size:** 5 lines (stub implementation)
- **Reason:** Duplicate from legacy `backend/` directory, superseded by full implementation in `src/backend/services/ModelService.ts` (85 lines with caching, Ollama integration, task-specific recommendations)
- **Status:** No imports found in codebase - safe to archive

## Verification

Build verified successful after archiving:
- `npm run build` completed without errors
- All TypeScript compilation passed
- No broken imports detected

## Notes

The legacy `backend/` directory has been completely removed after archiving its contents. All active code now resides under `src/`.
