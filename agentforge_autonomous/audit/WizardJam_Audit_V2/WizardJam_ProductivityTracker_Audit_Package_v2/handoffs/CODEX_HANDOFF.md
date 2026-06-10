# Codex Handoff
**Version:** 2.0
**Generated:** 2026-06-10
**For:** Codex (or any code-execution agent) resuming implementation work

---

## Environment

| Attribute | Value |
|---|---|
| OS | Windows 11 25H2 |
| Shell | PowerShell (primary) + Git Bash (available) |
| Node.js | 18+ (ES Modules only) |
| Package manager | npm (never yarn) |
| UE version | 5.4.4-35576357 |
| Compiler | Visual Studio 2022 14.38.33145 |

---

## Repository Roots

| Repo | Path |
|---|---|
| AgentForge | C:/Users/daley/Projects/SeniorDevBuddy/agentforge_autonomous |
| WizardJam 2.0 | C:/Users/daley/UnrealProjects/BaseGame |
| SeniorDevBuddy (parent) | C:/Users/daley/Projects/SeniorDevBuddy |

---

## Immediate Implementation Tasks (Ordered)

### Task 1: Fix agentEventBus Type Cast

**File:** `src/core/events/agent-event-bus.ts`
**Problem:** `(agentEventBus as unknown as { emit: (event: AgentEvent) => void }).emit(event)`
**Fix:** Define a typed `emit(event: AgentEvent): void` method on the `AgentEventBus`
class/interface and call it directly without the double cast.
**Test:** `npx tsc --noEmit` must pass after change.

### Task 2: Fix C4458 in AIC_QuidditchController.cpp

**File:** `Source/END2507/AIC_QuidditchController.cpp` line 651
**Problem:** Local variable named `Pawn` shadows `AController::Pawn`
**Fix:** Rename local variable to `ControlledPawn` or `TargetPawn`
**Test:** `build_20260607.log`-style build must complete without C4458

### Task 3: Fix BaseCharacter Cast Failures

**File:** `Source/END2507/AIC_QuidditchController.cpp` (search for `Cast<ABaseCharacter>`)
**Problem:** `Cast<ABaseCharacter>(GetPawn())` returns null for non-BaseCharacter pawns
**Fix:** Add `if (!Cast<ABaseCharacter>(GetPawn())) return;` guard, or use `IsA<ABaseCharacter>()`
**Test:** PIE session must show 0 "Failed to cast pawn to BaseCharacter" errors

### Task 4: Implement SSM SnapshotCollapser

**Design doc:** `audit/WizardJam_Audit_V2/WizardJam_ProductivityTracker_Audit_Package_v2/SSM_TRAINING_ARCHITECTURE.md`
**Input:** `C:/Users/daley/UnrealProjects/BaseGame/Saved/ProductivityTracker/Sessions/*.json`
**Output:** Collapsed activity blocks (JSONL, one block per line)
**Language:** Node.js (ES Modules), no external dependencies beyond built-ins
**Privacy:** Strip MachineId, RecordChecksum, SnapshotChecksum before output

### Task 5: Replace VMock Selectors

**File:** `apps/job-agent/config/settings.json` section: `resume.vmockSelectors`
**Method:** Inspect VMock DOM live in browser dev tools; find stable CSS selectors
**Test:** A5 pipeline must reach `vmock.scored` event without selector errors

---

## Command Reference

```powershell
# Type check
cd agentforge_autonomous
npx tsc --noEmit

# Run tests
npx vitest run

# Run A5 tests only
npx vitest run src/agents/resume-pipeline/

# Lint
npx next lint

# VMock auth setup
node agents/A5-auto-apply/setup-vmock-auth.mjs
```

---

## Git Workflow

Current branch: `feat/pdf-session-1-weasyprint`
126 modified/untracked files -- commit checkpoint before starting new work.

```powershell
git add <specific files>
git commit -m "checkpoint: V2 audit package complete"
```

Never commit: `.env` files, `outputs/` directory, credential files.
Never push directly to main. Feature branches only.

---

## Constraints

- ES Modules only: no `require()`, no `module.exports`
- npm only: never `yarn`
- No hardcoded values: all config from `apps/job-agent/config/settings.json`
- No em-dashes in any generated content
- No Vercel: Netlify only for web deployment
- No CommonJS in any new files
