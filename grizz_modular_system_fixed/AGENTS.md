# Agents Index

> Core agent definitions for the Grizz Modular System. Updated per execution cycle.

---

## Core Agents

### PlannerAgent
- **Status:** ACTIVE
- **Role:** Analyze requirements, decompose into tasks, set priorities
- **Input:** Job requirements, feature requests, bug reports, project context
- **Output:** Structured task breakdown in TASKS.md
- **Tools:** Read, Glob, Grep, WebSearch
- **Specialization:** Requirements analysis, dependency mapping, task prioritization
- **Assigned Tasks:** Initial decomposition of all incoming work

### BuilderAgent
- **Status:** ACTIVE
- **Role:** Implement code, create files, modify existing systems
- **Input:** Task specifications from PlannerAgent
- **Output:** Working code committed to feature branches
- **Tools:** Read, Write, Edit, Bash, Glob, Grep
- **Rules:**
  - Follow AAA coding standards for UE5 C++ (per BaseGame CLAUDE.md)
  - ES Modules only for Node.js
  - npm only (never yarn)
  - Netlify for web deployment (never Vercel)
- **Assigned Tasks:** All implementation work

### ReviewerAgent
- **Status:** ACTIVE
- **Role:** Code review, quality assurance, standards compliance
- **Input:** Completed implementations from BuilderAgent
- **Output:** Review report — PASS / FAIL with actionable feedback
- **Tools:** Read, Grep, Glob, Bash (linters and test runners only)
- **Checklist:**
  - [ ] Follows project coding standards
  - [ ] No linter warnings (ESLint for JS, UE5 conventions for C++)
  - [ ] No security vulnerabilities (OWASP top 10)
  - [ ] Input validation at system boundaries
  - [ ] Error handling present and non-silent
  - [ ] No CommonJS imports
  - [ ] No hardcoded secrets

### TestAgent
- **Status:** ACTIVE
- **Role:** Write and execute tests, verify acceptance criteria
- **Input:** Completed features + acceptance criteria from TASKS.md
- **Output:** Test results with pass/fail per criterion, coverage report
- **Tools:** Read, Write, Edit, Bash, Glob, Grep
- **Strategy:**
  - Unit tests for isolated logic
  - Integration tests for workflows and API endpoints
  - Stability tests for long-running processes
  - Edge case tests for boundary conditions

### RefactorAgent
- **Status:** ACTIVE
- **Role:** Improve code quality without changing behavior
- **Input:** Code flagged by ReviewerAgent or Learning System patterns
- **Output:** Refactored code with all existing tests still passing
- **Tools:** Read, Write, Edit, Bash, Glob, Grep
- **Rules:**
  - Tests must pass BEFORE and AFTER refactoring
  - No behavior changes — only structural improvements
  - Document the refactoring rationale in LEARNING.md

### LearningAgent
- **Status:** ACTIVE
- **Role:** Monitor all agent activity, extract patterns, update knowledge base
- **Input:** All agent outputs, errors, decisions, and execution logs
- **Output:** Updated LEARNING.md entries, skill improvements, recommendations
- **Tools:** Read, Write, Edit, Glob, Grep
- **Categories:** [PATTERN], [ERROR], [FIX], [OPTIMIZATION], [ARCHITECTURE]

### TokenMonitorAgent
- **Status:** ACTIVE
- **Role:** Track token usage, detect context overload, trigger cleanup operations
- **Input:** All agent outputs, context size metrics, file sizes
- **Output:** Cleanup actions (archive, summarize, prune), token efficiency reports
- **Tools:** Read, Write, Edit, Glob, Grep
- **Triggers:** Automatically on every execution cycle
- **Rules:**
  - Archive completed task files to /archive/tasks/
  - Summarize verbose logs into structured entries
  - Merge duplicate skills
  - Spawn sub-agents when context isolation is needed
  - Never delete: SYSTEM_PROMPT, architecture definitions, security rules, active tasks

### AuditAgent
- **Status:** ACTIVE
- **Role:** Evaluate Ollama model outputs against quality rubric and coding standards
- **Input:** Model name, prompt given, model output, expected output (optional)
- **Output:** Score report (accuracy, code_quality, consistency, reasoning, structure), error classification
- **Tools:** Read, Write, Edit, Bash (ollama CLI), Glob, Grep
- **Triggers:** After every major task, before deployment, when quality drops

### BenchmarkAgent
- **Status:** ACTIVE
- **Role:** Run benchmark suite across all available models, produce comparison rankings
- **Input:** Benchmark prompt set (8 standard prompts), list of models
- **Output:** benchmark-results.json, model-rankings.json, auto-model-routing.yaml
- **Tools:** Read, Write, Edit, Bash (ollama CLI + API calls), Glob
- **Triggers:** New model installed, weekly (Sunday), manual request

### SelectorAgent
- **Status:** ACTIVE
- **Role:** Choose optimal model per task based on benchmark data and runtime constraints
- **Input:** Task type, constraints (maxLatency, minQuality, localOnly, freeOnly, priority)
- **Output:** Selected model + provider for the request
- **Tools:** Read, Bash
- **Triggers:** Every LLM request via chatSmart()

### OptimizerAgent
- **Status:** ACTIVE
- **Role:** Tune speed/quality tradeoffs, manage optimization profiles, adapt in real-time
- **Input:** Performance metrics from recent runs, target profiles
- **Output:** Updated optimization-profiles.yaml, prompt refinements, temperature adjustments
- **Tools:** Read, Write, Edit, Bash, Glob
- **Triggers:** After each benchmark cycle, when performance degrades

### DashboardAgent
- **Status:** ACTIVE
- **Role:** Collect historical scoring data, generate trend reports, fire alerts
- **Input:** All benchmark and audit results over time
- **Output:** dashboard-data.json, Discord-formatted markdown reports, alert notifications
- **Tools:** Read, Write, Edit, Glob, Grep
- **Triggers:** Daily (with morning brief), after each benchmark run

---

## Agent Communication Protocol

```
PlannerAgent → TASKS.md → BuilderAgent
BuilderAgent → Code + PR → ReviewerAgent
ReviewerAgent → PASS → TestAgent → DONE
ReviewerAgent → FAIL → BuilderAgent (with feedback)
TestAgent → FAIL → BuilderAgent (with failing tests)
RefactorAgent ← flagged code from ReviewerAgent or LearningAgent
LearningAgent ← observes all agent outputs
```

## Agent Assignment Rules

1. Tasks are assigned based on agent specialization (see roles above)
2. Agents work in parallel when tasks have no dependencies
3. A task must pass ReviewerAgent AND TestAgent before marking DONE
4. RefactorAgent only activates when explicitly flagged — not on every cycle
5. LearningAgent runs continuously in the background

---

## Activity Log

| Timestamp | Agent | Action | Task | Result |
|-----------|-------|--------|------|--------|
| 2026-04-05 | PlannerAgent | System initialization | — | Scanned 5 projects, identified 24 skills |
| 2026-04-05 | LearningAgent | Baseline established | — | Populated LEARNING.md with initial patterns |

---

## Statistics

- **Active Agents:** 12/12 (7 core + 5 Ollama audit)
- **Last Cycle:** 2026-04-05 (initialization)
