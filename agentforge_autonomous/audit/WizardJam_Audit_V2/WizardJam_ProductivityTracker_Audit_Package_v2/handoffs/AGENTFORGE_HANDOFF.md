# AgentForge Handoff
**Version:** 2.0
**Generated:** 2026-06-10
**For:** Any AgentForge agent or session resuming this work

---

## Do Not Re-Derive These Facts

| Fact | Correct value |
|---|---|
| DPT output path | `Saved/ProductivityTracker/` (NOT `Saved/DeveloperProductivityTracker/`) |
| Session schema field | `ActivitySnapshots` (NOT `Events` or `StateTransitions`) |
| Snapshot polling interval | 30 seconds |
| EActivityState::Away | integer value 2 |
| EActivityState::Active | integer value 1 -- never observed in sampled data |
| Crash recovery path | `FOnSessionRecovered` -- confirmed working in WizardJam2.0.log |
| Build error | C4458 at AIC_QuidditchController.cpp:651 |
| Runtime error | "Failed to cast pawn to BaseCharacter" (11 instances per PIE session) |
| v1 package | v1.1: 14 full files, 29,826 bytes (NOT 8 stubs, 1,845 bytes) |
| V2 package location | `audit/WizardJam_Audit_V2/WizardJam_ProductivityTracker_Audit_Package_v2/` |
| Phase 0 status | COMPLETE -- 73 files at `C:/Users/daley/Recovery/2026-06-10_02-23/` |
| AgentForge branch | `feat/pdf-session-1-weasyprint` (126 modified/untracked files) |

---

## Project State

### AgentForge Pipeline

A1-A4: ACTIVE. All Phase 1 deliverables (D1-D10) complete per ChatGPT audit 2026-05-09.
A5: ACTIVE but BLOCKED on VMock selectors (placeholders in settings.json).
Phase 2+: All dormant (scrapers, HoneyBadgerVault, Gmail, skill compiler).

### A5 Blockers (clear in order)

1. Verify `C:/Users/daley/Resumes/` has at least one .docx file
2. Run `node agents/A5-auto-apply/setup-vmock-auth.mjs`
3. Add `HF_BEARER_TOKEN=hf_...` to `agentforge_autonomous/.env`
4. Inspect VMock DOM live; replace `vmockSelectors` in `apps/job-agent/config/settings.json`

### Highest-Priority Code Fix

File: `src/core/events/agent-event-bus.ts`
Problem: `(agentEventBus as unknown as {...}).emit(event)` double-cast bypasses TypeScript.
Fix: Define typed `emit` on the bus interface.

### Test Baseline

```bash
cd agentforge_autonomous
npx vitest run src/agents/resume-pipeline/   # must show 16/16
```

---

## WizardJam State

Source: 249 files at `BaseGame/Source/END2507/`
Active bugs:
- AIC_QuidditchController.cpp:651 -- C4458 Pawn shadowing (rename local variable)
- Cast failures -- 11x "Failed to cast pawn to BaseCharacter" per PIE session

C1/C2/C3 claims from architecture PDF: NOT YET SOURCE-VERIFIED.
Files to read: AC_BroomComponent.cpp, BTService_FindStagingZone.cpp, AIC_QuidditchController.cpp

MCP bridge: active on 127.0.0.1:55557 (AgentForge-to-UE command channel).

---

## DPT State

51 sessions, 5 daily summaries, active session preserved by Phase 0.
Schema confirmed. Extraction pipeline designed (SSM_TRAINING_ARCHITECTURE.md).
ExternalActivityMonitor inactive -- SecondsByApplication always empty.
ActiveSeconds always 0 -- calibration issue or accurate idle.

---

## Adopted Rules

```
AUDIT PACKAGE VALIDATION RULE:
Before generating any V2 package:
1. Verify evidence exists.
2. Verify telemetry exists.
3. Verify logs exist.
4. Verify repository exists.
5. Verify assets exist.
If any evidence is missing: generate MISSING_EVIDENCE_REPORT.md first.
Never invert this order.
```

---

## Architecture Constraints (Always Apply)

- Event-driven only: no polling loops inside agents
- Config-driven: no hardcoded values (read from settings.json)
- ES Modules only: no require() or module.exports
- Use agentEventBus for all inter-agent communication
- No em-dashes anywhere in output
- Structured logging: ERROR/WARN/INFO/DEBUG only
- npm only (never yarn)
- Netlify for web deployment (never Vercel)
- Free-tier LLM providers first: Ollama -> Groq -> Cerebras -> Together -> Mistral -> Claude -> OpenAI
