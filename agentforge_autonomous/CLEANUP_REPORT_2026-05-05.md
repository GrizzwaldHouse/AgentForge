# AgentForge Cleanup Report

Date: 2026-05-05
Target: `agentforge_autonomous`
Scope: stabilize the runnable AgentForge project without guessing about unrelated work

## Current State Summary

`agentforge_autonomous` is the runnable TypeScript/Next.js target. It already contains a substantial amount of implemented work:

- Orchestration paths exist in `src/app/api/agent/run/route.ts`, `src/backend/services/ObservableOrchestrator.ts`, and `src/orchestrator/SupervisorOrchestrator.ts`.
- Event streaming and session replay plumbing exist in `src/core/events/agent-event-bus.ts`, `src/core/events/session-persistence.ts`, `src/app/api/agent/events/route.ts`, `src/app/api/agent/last-session/route.ts`, and `src/hooks/use-agent-events.ts`.
- Dashboard, jobs UI, safety UI, job API routes, resume generator, cover-letter generator, pipeline route, and brainstorm route all exist under `src/app/`.
- The project has moved beyond the older Phase 2 handoff and beyond the stale `task-queue.json` / `memory-index.json` planning artifacts.

At the same time, the repo is still in a mixed state:

- Old AgentForge planning artifacts live in `AgentForge/`.
- Analysis dumps live in `AgentForge_Baseline/`.
- Extracted bundle dumps live in `AgentForge_Extracted/`.
- At least one old worktree still exists under `.claude/worktrees/agent-adcadd95caeaedcff/`.
- Some current source files still reflect partially integrated or legacy behavior.

## Evidence-Based Ambiguities

These are real blockers to a perfect dirty-file inventory:

1. I could not verify an exact git porcelain state from this tool session. `git status`, `git diff`, and `git log` returned no usable output, and no `.git` directory was discoverable under either `SeniorDevBuddy/` or `agentforge_autonomous/` through file listing.
2. Because of that, this report distinguishes:
   - files that are clearly active and relevant,
   - files that are clearly generated or ignored,
   - files that are likely migration inputs or cleanup candidates,
   - files whose tracked/untracked status still needs one clean local git check.
3. Shell tooling is also behaving inconsistently. `agentforge_autonomous/.omc/state/last-tool-error.json` records a prior failure caused by using PowerShell commands in a bash shell, so command-output trust is currently low.

## Dirty-File Analysis by Group

### A. Active runnable project files that matter right now

These should be treated as the stabilization surface for AgentForge:

- Core runtime and orchestration:
  - `src/app/api/agent/run/route.ts`
  - `src/backend/services/ObservableOrchestrator.ts`
  - `src/orchestrator/SupervisorOrchestrator.ts`
  - `src/backend/execution/ExecutionBackend.ts`
  - `src/backend/execution/SimulatedBackend.ts`
  - `src/backend/execution/OllamaBackend.ts`
  - `src/backend/execution/ProviderChainBackend.ts`
  - `src/backend/services/LLMProviderChain.ts`
  - `src/backend/services/ModelService.ts`
  - `src/routing/ModelRouter.ts`
  - `src/healing/*`
  - `src/safety/*`

- Event and observability layer:
  - `src/core/events/*`
  - `src/core/observability/*`
  - `src/hooks/use-agent-events.ts`
  - `src/app/api/agent/events/route.ts`
  - `src/app/api/agent/last-session/route.ts`

- UI and workflow pages:
  - `src/app/dashboard/page.tsx`
  - `src/app/jobs/page.tsx`
  - `src/app/safety/page.tsx`
  - `src/components/*`

- Job workflow:
  - `src/job-system/*`
  - `src/app/api/jobs/*`

- Specialized agent routes and agents:
  - `src/agents/*`
  - `src/app/api/brainstorm/route.ts`
  - `src/app/api/pipeline/route.ts`
  - `src/app/api/gmail/webhook/route.ts`

### B. Likely completed work already integrated into the runnable target

These areas look materially implemented, not just skeletons:

- Observable event pipeline and dashboard replay:
  - `src/core/events/agent-event-bus.ts`
  - `src/core/events/session-persistence.ts`
  - `src/hooks/use-agent-events.ts`
  - `src/app/api/agent/last-session/route.ts`
  - `src/app/dashboard/page.tsx`

- Job application MVP surfaces:
  - `src/job-system/store.ts`
  - `src/app/api/jobs/route.ts`
  - `src/app/api/jobs/[id]/route.ts`
  - `src/app/api/jobs/stats/route.ts`
  - `src/app/api/jobs/generate-resume/route.ts`
  - `src/app/api/jobs/generate-cover-letter/route.ts`
  - `src/app/jobs/page.tsx`

- Brainstorm feature:
  - `src/agents/brainstorm/BrainstormAgent.ts`
  - `src/agents/brainstorm/types.ts`
  - `src/app/api/brainstorm/route.ts`
  - `src/agents/__tests__/brainstorm.test.ts`

- Pipeline wrapper and related fixes:
  - `src/agents/pipeline/PipelineAgent.ts`
  - `src/lib/pipeline-runner.ts`
  - `src/app/api/pipeline/route.ts`

### C. Partially integrated or stale files

These are the biggest cleanup targets because they describe an earlier system state than the code now shows:

- `task-queue.json`
  - Still says `SimulatedBackend`, `OllamaBackend`, `ObservableOrchestrator`, and `run/route.ts` refactor are pending, but those files already exist.
  - It is now a stale planning artifact and should not be used as the live source of truth.

- `memory-index.json`
  - Still describes placeholder dashboards and older file layout such as `src/app/(dashboard)/page.tsx`.
  - It is materially out of sync with the current app structure.

- `SESSION_HANDOFF.md`
  - Still claims the project is at "Phase 2 complete / Phase 3 next" even though multiple later-phase files now exist.

- `README.md`
  - Too minimal to serve as reliable current-state guidance.

- `frontend/app/page.tsx`
  - Appears to be a leftover duplicate entrypoint outside the actual `src/app/` runtime tree.
  - This looks obsolete unless something external still references `frontend/`.

### D. Duplicated / obsolete / migration-input material outside the runnable target

These should not drive current implementation unless explicitly imported into the stabilization plan:

- `AgentForge/`
  - Useful as canonical planning and product-source-of-truth material.
  - Not the runnable app.
  - Keep as planning artifacts and design reference.

- `AgentForge_Baseline/`
  - Analysis outputs such as `baseline_summary.md`, `duplication_report.json`, `file_index.json`, etc.
  - Useful as migration evidence.
  - Several findings are stale or naive now. Example: the duplication report flags many unrelated `index.ts`, `types.ts`, `page.tsx`, and `layout.tsx` files as "duplicates" when they are just normal module names across different feature areas.

- `AgentForge_Extracted/`
  - Appears to be extracted historical bundles and transfer packs.
  - Treat as migration inputs or archival material, not active code.
  - Strong cleanup candidate if currently inside the same git repo.

- `.claude/worktrees/agent-adcadd95caeaedcff/`
  - Leftover worktree state is still present.
  - Needs explicit reconciliation against the main runnable tree, then deletion if fully merged or obsolete.

### E. Generated or runtime data that should stay ignored

These should not be part of stabilization commits unless there is a deliberate reason:

- `.next/`
- `node_modules/`
- `tsconfig.tsbuildinfo`
- `.omc/`
- `data/job-applications.json`

This matches both `agentforge_autonomous/.gitignore` and the root `.gitignore` intent.

## Risks and Blockers

### Confirmed current risks

1. `src/agents/pipeline/PipelineAgent.ts`
   - `sync` and `full` do not enforce `context.message`.
   - The API route validates it, but the agent itself does not.
   - Risk: behavior drift between route-based execution and direct agent execution.

2. `src/app/api/pipeline/route.ts`
   - Uses a module-level `pipelineRunning` boolean.
   - In a hot-reload or multi-instance runtime, this is not a durable or globally safe lock.
   - Risk: false negatives, overlapping runs, or lock loss.

3. `src/app/api/pipeline/route.ts` and `src/agents/pipeline/PipelineAgent.ts`
   - `VALID_COMMANDS` is duplicated.
   - Risk: future command mismatch between route and agent.

4. `src/app/api/pipeline/route.ts`
   - Returns raw `runPipelineCommand()` results without the sort of response scrubbing used in `src/app/api/agent/run/route.ts`.
   - Risk: internal output leakage or inconsistent API contract.

5. `task-queue.json`, `memory-index.json`, `SESSION_HANDOFF.md`
   - They describe an older project state and will mislead future sessions.
   - Risk: agents and humans plan from stale artifacts.

### Strategic risks

1. Product-scope drift against the current source of truth in `AgentForge/AGENTS.md`
   - Current MVP rule says keep focus on opportunity discovery, scoring, proposal generation, safety approval, and logging.
   - Gmail automation is explicitly deferred in the planning docs, but `src/app/api/gmail/webhook/route.ts` and `src/agents/gmail/*` are present in the runnable app.
   - Brainstorm work may be useful, but it is not central to the stated revenue workflow.

2. Old extracted bundles may contaminate cleanup decisions
   - There is a lot of nearby AgentForge-branded historical material.
   - Risk: copying from stale sources or trying to merge multiple designs at once.

3. Worktree residue
   - If the remaining worktree contains changes not in the main tree, deleting it blindly risks losing work.
   - If it is already merged, keeping it around increases confusion.

### Pre-existing failure indicators

These appear to be known carry-forward issues from the existing handoff and current code inspection:

- `src/orchestrator/__tests__/self-healing.test.ts`
  - Previous handoff reports a remaining expectation drift around retry count.
  - This still appears to be a known pre-existing failure candidate.

- Command verification ambiguity
  - Local shell command output was not trustworthy in this session.
  - Build and test verification must be re-run locally from a known-good terminal before declaring the project stable.

## Recommended File Categorization

### Keep and stabilize now

- Everything under `agentforge_autonomous/src/`
- `agentforge_autonomous/package.json`
- `agentforge_autonomous/package-lock.json`
- `agentforge_autonomous/next.config.ts`
- `agentforge_autonomous/tsconfig.json`
- `agentforge_autonomous/vitest.config.ts`
- `agentforge_autonomous/.env.example`
- `agentforge_autonomous/config/default.json`
- `agentforge_autonomous/electron/*`
- `agentforge_autonomous/electron-builder.yml`

### Keep as supporting artifacts

- `AgentForge/`
- `session-prompts/agentforge-session-prompt.json`
- `AgentForge_Baseline/` only if Marcus still wants the research outputs nearby

### Treat as migration inputs, not live code

- `AgentForge_Extracted/`
- `UNIFICATION_PLAN.md`
- older handoff and analysis files at the repo root

### Cleanup candidates after reconciliation

- `.claude/worktrees/agent-adcadd95caeaedcff/`
- `agentforge_autonomous/frontend/`
- stale state files:
  - `agentforge_autonomous/task-queue.json`
  - `agentforge_autonomous/memory-index.json`
  - `agentforge_autonomous/SESSION_HANDOFF.md`

## Phase-by-Phase Cleanup Task List

### Phase 0 — Ground Truth Recovery

Goal: get one trustworthy source of status before touching code.

1. From a trusted local terminal inside `SeniorDevBuddy`, run:
   - `git rev-parse --show-toplevel`
   - `git status --short`
   - `git diff --stat`
   - `git worktree list`
2. Confirm whether `SeniorDevBuddy/` is the actual git root.
3. Confirm whether `.claude/worktrees/agent-adcadd95caeaedcff/` contains unmerged changes.
4. Freeze the runnable scope to `agentforge_autonomous/` plus planning docs in `AgentForge/`.

### Phase 1 — Artifact and Directory Triage

Goal: reduce confusion without changing behavior.

1. Classify and label `AgentForge/`, `AgentForge_Baseline/`, and `AgentForge_Extracted/`.
2. Decide whether extracted bundles stay in-repo, move to `archive/`, or leave the git repo entirely.
3. Verify whether `agentforge_autonomous/frontend/` is unused; if unused, plan deletion.
4. Remove or archive stale worktree directories only after confirming they are merged or obsolete.

### Phase 2 — Runtime Contract Cleanup

Goal: make the runnable AgentForge code internally consistent.

1. Consolidate shared pipeline command constants into one module.
2. Add message validation inside `PipelineAgent` for `sync` and `full`.
3. Replace module-level `pipelineRunning` with a safer coordination approach.
   - If single-process only: move lock to `globalThis`.
   - If multi-instance later: move to file lock, lightweight store, or queue.
4. Scrub or normalize `/api/pipeline` responses the same way `/api/agent/run` scrubs sensitive internals.

### Phase 3 — Source-of-Truth Cleanup

Goal: stop stale artifacts from lying about project status.

1. Rewrite `README.md` to reflect the real current system.
2. Replace `SESSION_HANDOFF.md` with a current handoff or archive it.
3. Either regenerate or remove:
   - `task-queue.json`
   - `memory-index.json`
4. Document that `AgentForge/AGENTS.md` and `AgentForge/docs/prd/PRD_v3_FULL.md` are the planning source of truth, while `agentforge_autonomous/` is the runnable implementation.

### Phase 4 — Scope Alignment

Goal: align the runnable app to the current MVP.

1. Compare current implemented surfaces against `AgentForge/AGENTS.md`.
2. Decide what remains in MVP:
   - jobs workflow
   - proposal/resume generation
   - safety approval
   - observability/dashboard
3. Decide what becomes deferred:
   - Gmail webhook flow
   - brainstorm feature if not required for the MVP
   - any legacy control-plane or extracted-bundle ideas
4. Mark deferred modules clearly rather than leaving them half-promoted as live features.

### Phase 5 — Verification and Hardening

Goal: get a trustworthy green loop for daily development.

1. Re-run:
   - `npm run build`
   - `npm test`
   - `npm run lint`
2. Investigate the known self-healing retry test drift first.
3. Decide whether real-Ollama tests remain optional skips or become required in a separate suite.
4. Add one visible build/test workflow inside JetBrains so every cycle surfaces failures immediately.

## Recommended Branch and Integration Strategy

Do not work on `main` directly.

Recommended flow:

1. Create a dedicated cleanup branch from the real repo root once confirmed, for example:
   - `feature/agentforge-cleanup-stabilization`
2. Land work in this order:
   - artifact triage
   - runtime contract cleanup
   - stale state/source-of-truth cleanup
   - scope alignment
   - verification fixes
3. Keep commits narrow:
   - `chore(agentforge): reconcile worktree and archive leftovers`
   - `fix(agentforge): unify pipeline command validation and locking`
   - `docs(agentforge): refresh handoff and cleanup stale planning artifacts`
4. If any mirrored modular-system files are touched, update both:
   - `grizz_modular_system/*`
   - `grizz_modular_system_fixed/*`
5. Do not pull extracted bundle content into the runnable target without explicit file-by-file justification.

## JetBrains Build Visibility Setup

Marcus wants visible build/test feedback on every cycle. The simplest reliable setup is to make JetBrains run npm tasks as first-class Run Configurations and show failures in the Services / Run tool windows.

### Recommended baseline

Create three Run Configurations in WebStorm or IntelliJ:

1. `AgentForge Build`
   - Working directory: `agentforge_autonomous`
   - Command: `npm run build`

2. `AgentForge Test`
   - Working directory: `agentforge_autonomous`
   - Command: `npm test`

3. `AgentForge Lint`
   - Working directory: `agentforge_autonomous`
   - Command: `npm run lint`

Add them to a Compound configuration named:

- `AgentForge Verify`

This gives Marcus one click for a visible red/green verification pass.

### Recommended daily loop

1. Keep the Services or Run window docked and always visible.
2. Enable "Allow multiple instances" only if needed; otherwise keep it off so failures are easy to track.
3. Pin the `AgentForge Verify` configuration to the toolbar.
4. Use the built-in problem output parsing so TypeScript and test failures become clickable file links.

### Stronger setup

If Marcus wants immediate signal after every save:

1. Add a File Watcher or JetBrains "Before launch" task for:
   - `npm test`
   - or a lighter `vitest --run <focused suite>` during active work
2. For terminal-driven work, use a dedicated JetBrains terminal tab running:
   - `npm test -- --watch`
3. If the project adopts a stricter verification script later, replace the compound config with:
   - `npm run verify`
   where `verify` chains build + test + lint.

### Best next improvement

Add a single `verify` script to `package.json` once cleanup work starts:

- `verify`: run build, tests, and lint in a deterministic order

Then JetBrains only needs one configuration, and Marcus gets a single visible success/failure indicator every cycle.

## Recommended Next Session Order

1. Confirm real git root and exact dirty state locally.
2. Reconcile or remove the remaining `.claude/worktrees/*` state.
3. Clean up stale planning/state artifacts in `agentforge_autonomous`.
4. Fix the pipeline contract issues still open in the live code.
5. Decide whether Gmail and Brainstorm stay in MVP or get explicitly deferred.
6. Wire JetBrains `AgentForge Verify` and make it the default daily loop.

## Bottom Line

The runnable target is no longer a stub-only project. The main problem is not "missing implementation" so much as "mixed layers of truth":

- current runnable code in `agentforge_autonomous/`
- planning truth in `AgentForge/`
- stale machine-generated state files in the runnable project
- old extracted bundles and leftover worktree residue around it

The cleanup should therefore start with reconciliation and truth-setting, not a broad rewrite.
