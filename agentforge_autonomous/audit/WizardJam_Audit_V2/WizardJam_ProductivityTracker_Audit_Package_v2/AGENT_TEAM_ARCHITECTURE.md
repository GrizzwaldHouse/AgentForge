# Agent Team Architecture
**Version:** 2.0
**Generated:** 2026-06-10

---

## AgentForge Pipeline State (From ChatGPT docs/audit/, 2026-05-09)

### Active Pipeline (A1-A4)

| Agent | File | Event in | Event out | Status |
|---|---|---|---|---|
| A1 JobIngestion | src/agents/job-pipeline/JobIngestionAgent.ts | orchestrator start | job.ingested | ACTIVE |
| A2 JobMatching | src/agents/job-pipeline/JobMatchingAgent.ts | job.ingested | job.matched | ACTIVE |
| A3 ProposalGeneration | src/agents/job-pipeline/ProposalGenerationAgent.ts | job.matched | proposal.generated | ACTIVE |
| Critic | src/agents/job-pipeline/CriticAgent.ts | proposal.generated | proposal.approved | ACTIVE |
| A4 ApplicationOutput | src/agents/job-pipeline/ApplicationOutputAgent.ts | proposal.approved | application.queued | ACTIVE |

All A1-A4 agents communicate via `agentEventBus` singleton at
`src/core/events/agent-event-bus.ts`.

### Resume Pipeline (A5)

| Agent | File | Event in | Event out | Status |
|---|---|---|---|---|
| A5a ResumeSelection | src/agents/resume-pipeline/ResumeSelectionAgent.ts | job.ingested (parallel) | resume.selected | ACTIVE |
| A5b VmockRunner | src/agents/resume-pipeline/VmockRunnerAgent.ts | resume.selected | vmock.scored | ACTIVE |
| A5 Orchestrator | src/agents/resume-pipeline/ResumePipelineOrchestrator.ts | job.ingested | resume.approved | ACTIVE |

### Dormant Systems (Phase 2+)

| System | Status | Activation trigger |
|---|---|---|
| Himalayas/RemoteOK adapters | Dormant | Phase 2: live scraping |
| A5 ApplicationSubmitAgent | Dormant | VMock selectors must be replaced first |
| HoneyBadgerVault | Dormant | Phase 2: credential storage |
| Pipeline dashboard | Dormant | Phase 2: monitoring |
| Gmail ingestion | Dormant | Phase 3 |
| Skill compiler (SkillClassifierAgent, SkillCompilerAgent) | Dormant | Phase 2 |
| Conversation intelligence | Dormant | Phase 2 |
| Domain partitioning (non-career) | Dormant | DomainRegistry.ts update required |

### Domain Status

| Domain | Status | Activation |
|---|---|---|
| career-intelligence | ACTIVE | Default |
| game-dev | Dormant | Update DomainRegistry.ts |
| ai-engineering | Dormant | Update DomainRegistry.ts |
| va-medical | Dormant | Update DomainRegistry.ts |
| educational | Dormant | Update DomainRegistry.ts |

---

## A5 Blockers (Must Clear Before End-to-End Run)

| Blocker | Status | Action |
|---|---|---|
| Resume vault exists | UNKNOWN | Verify C:/Users/daley/Resumes/ has .docx files |
| VMock selectors replaced | BLOCKED | Inspect VMock DOM live; replace placeholders in settings.json |
| HF_BEARER_TOKEN in .env | UNKNOWN | Add HF_BEARER_TOKEN=hf_... to agentforge_autonomous/.env |
| VMock auth session | UNKNOWN | Run: node agents/A5-auto-apply/setup-vmock-auth.mjs |

---

## Proposed Refactors (From ChatGPT audit, 2026-05-09)

| ID | Description | File | Priority |
|---|---|---|---|
| R1 | Remove `(agentEventBus as unknown as {...}).emit(event)` cast | agent-event-bus.ts | HIGH -- type safety |
| R2 | Extract prompts to apps/job-agent/config/prompts/ | ProposalGenerationAgent.ts, CriticAgent.ts | MEDIUM |
| R3 | Add outputs/ to .gitignore | .gitignore | LOW |
| R4 | Fix SSE close race with pipeline.ingestion_complete event | SSE route handler | MEDIUM |

R1 is the highest priority: the cast to `unknown` then to a specific event emitter type
bypasses TypeScript's type system. If the event bus interface changes, this silently
breaks without compile errors.

---

## WizardJam-to-AgentForge Integration Architecture

The Unreal MCP bridge (confirmed active on 127.0.0.1:55557) provides a real-time
command channel from AgentForge into the UE editor. The MCPCommandPanel polls
`http://127.0.0.1:8000` every 1.5 seconds.

Proposed integration:

```
AgentForge (Node.js)
  -> POST http://127.0.0.1:8000/command
    -> MCPCommandPanel polls and receives command
      -> EpicUnrealMCPBridge routes to UE subsystem
        -> UE executes command (compile, PIE, Blueprint edit, etc.)
          -> Result logged to WizardJam2.0.log
            -> LogEventExtractor reads result
              -> AgentForge receives feedback
```

This forms a closed loop: AgentForge issues commands, reads results, and updates
the SSM dataset with agent-assisted development sequences.

---

## Planned Agents (Phase 2+)

### WizardJamAuditAgent

Reads WizardJam source files and verifies C1/C2/C3 pitfall claims from the architecture PDF.
Input: Source/END2507/*.cpp
Output: Verified/Refuted table for WIZARDJAM_AUDIT_PLAN.md

### SSMExtractionAgent

Runs the extraction pipeline defined in SSM_TRAINING_ARCHITECTURE.md.
Input: Sessions/*.json + WizardJam2.0.log
Output: SSM_DATASET.jsonl

### PrivacyFilterAgent

Applies the privacy gate before SSM_DATASET.jsonl is finalized.
Input: Raw SSM_DATASET.jsonl
Output: Filtered SSM_DATASET.jsonl (MachineId stripped, app names redacted)

### AppleCloudIngestionAgent

Runs after iCloud download completes.
Input: C:/Users/daley/Recovery/[date]/Photos/, Videos/, Documents/
Gate: Marcus explicit approval per batch + privacy filter
Output: Business-relevant facts extracted to AgentForge memory

---

## Architecture Constraints (Apply to All Agents)

- Event-driven only: no polling loops inside agents
- Config-driven: no hardcoded values (read from settings.json)
- ES Modules only: no require() or module.exports
- Use agentEventBus for all inter-agent communication
- Structured logging: ERROR/WARN/INFO/DEBUG only, no console.log
- No em-dashes in any output
- Test baseline: 16/16 resume-pipeline tests must pass before merge
