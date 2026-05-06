# PRD Addendum: Agent A5, Playwright Auto-Apply

Status: DRAFT, awaiting wizard confirmation
Owner: AgentForge core
Phase: 2 (after A1/A2/A3/A4 are stable in production)
Source of truth: this document extends `docs/PRD.md`, it does not replace it
Pipeline position: appended after `application_output (A4)`

```
job_ingestion (A1) -> job_matching (A2) -> proposal_generation (A3) -> application_output (A4) -> auto_apply (A5)
```

A5 only fires on events emitted by A4. A5 never polls. A5 never reads from another agent's memory directly.

---

## 1. Problem Statement

A1 through A4 produce a tailored application package: matched job, scored, proposal written, output formatted. A human still has to open the browser and submit. That step is the bottleneck between AgentForge and revenue.

A5 closes the loop by submitting the application via Playwright on the user's machine, with structured logging, an audit trail, and a kill switch.

A5 is the highest-risk component in the pipeline because external sites change selectors, deploy CAPTCHAs, and ban automated traffic. Its design assumes those things will happen.

---

## 2. Goals

1. Submit applications to a configurable list of ATS platforms and job boards.
2. Respect a hard daily cap and a minimum match score gate.
3. Produce a per-submission audit record with screenshots, selector traces, and outcome.
4. Detect anti-bot measures and pause cleanly without burning the session.
5. Stay event-driven, config-driven, no global state.

## 3. Non-Goals

1. Solving CAPTCHAs.
2. Bypassing rate limits or paid-only application gates.
3. Creating accounts on behalf of the user.
4. Submitting on platforms that explicitly forbid automation in their TOS without an opt-in flag.
5. Replacing A3 (proposal generation) or A2 (matching). A5 is a submission layer only.

---

## 4. Wizard Decisions (to be locked by the user)

The decisions below are the variables the rest of the spec depends on. The user fills these in via the brainstorming wizard, then this section becomes the locked artifact.

| Decision | Variable | Default | Notes |
|----------|----------|---------|-------|
| Autonomy mode | `A5_AUTONOMY_MODE` | `assisted_review` | One of: `assisted_review`, `threshold_auto`, `full_auto`. |
| Target sources | `A5_TARGET_SOURCES` | `["greenhouse", "lever", "ashby"]` | Multi-select. ATS platforms first because their DOM is more stable than LinkedIn or Upwork. |
| Daily cap | `A5_DAILY_CAP` | `10` | Hard stop. A5 emits `DailyCapReachedEvent` and shuts the loop until next UTC day. |
| Match score gate | `A5_MIN_MATCH_SCORE` | `0.75` | Below this, A5 refuses to apply even in `full_auto`. |
| CAPTCHA strategy | `A5_CAPTCHA_STRATEGY` | `pause_notify` | One of: `pause_notify`, `skip_log`, `kill_switch`. |
| Audit sink | `A5_AUDIT_SINKS` | `["outputs_jsonl", "sqlite"]` | Where the submission record lands. Multi-select. |
| Session strategy | `A5_SESSION_STRATEGY` | `persistent_profile` | One of: `persistent_profile`, `rotating_contexts`, `headed_visible`. |
| Trigger event | `A5_TRIGGER_EVENT` | `ApplicationReadyEvent` | Emitted by A4 when the application package is complete. |
| Selector strategy | `A5_SELECTOR_STRATEGY` | `hybrid` | One of: `config_yaml`, `llm_resolver`, `hybrid`. Hybrid means config first, LLM fallback. |
| Document source | `A5_DOCUMENT_SOURCE` | `hybrid_static_resume` | Resume from `/assets/resume.pdf`, cover letter from A3 output. |
| Hard rules | `A5_HARD_RULES` | (user-defined) | Free-text rules: blocklist domains, skip-conditions, etc. |

All variables live in `apps/job-agent/config/settings.json` under the `auto_apply` block. No values are hardcoded.

---

## 5. Architecture

A5 is a single agent with three internal modules, all dependency-injected.

### 5.1 Modules

| Module | Responsibility | Key interface |
|--------|---------------|---------------|
| `BrowserSession` | Owns the Playwright `BrowserContext` lifecycle, cookies, viewport, user agent. | `navigate`, `screenshot`, `close` |
| `FormFiller` | Maps `ApplicationPackage` fields to selectors, attaches files, fills inputs. | `fill(package, selector_set)` |
| `SubmissionAuditor` | Wraps every action in a structured log entry, captures screenshots, persists to audit sink. | `record(event, payload)` |

A5 itself is the orchestrator. It receives the trigger event, asks each module to do its part, emits the result event.

### 5.2 Event Contracts

Inbound (subscribed):

```json
{
  "event": "ApplicationReadyEvent",
  "version": "1.0",
  "payload": {
    "application_id": "string",
    "job": { "source": "string", "url": "string", "ats": "string", "title": "string", "company": "string" },
    "match_score": "number",
    "documents": { "resume_path": "string", "cover_letter_text": "string" },
    "answers": { "field_id": "value" },
    "metadata": { "generated_at": "iso8601", "agent": "A4" }
  }
}
```

Outbound (emitted):

```json
{
  "event": "ApplicationSubmittedEvent | ApplicationFailedEvent | ApplicationSkippedEvent",
  "version": "1.0",
  "payload": {
    "application_id": "string",
    "outcome": "submitted | failed | skipped",
    "reason": "string",
    "evidence": { "screenshot_path": "string", "audit_log_path": "string" },
    "duration_ms": "number",
    "timestamp": "iso8601"
  }
}
```

Plus operational events: `DailyCapReachedEvent`, `CaptchaDetectedEvent`, `KillSwitchTrippedEvent`.

### 5.3 Selector Configuration

`apps/job-agent/config/selectors/<ats>.yaml`. One file per ATS. Each file declares the selector chain for every form field, with fallback selectors in priority order. When all selectors in the chain miss, A5 emits `SelectorChainBrokenEvent` and either:

- Skips the job (if `A5_SELECTOR_STRATEGY=config_yaml`).
- Asks the LLM resolver to inspect the DOM (if `hybrid` or `llm_resolver`).

Example structure (illustrative, not the full file):

```yaml
ats: greenhouse
version: 1.0
fields:
  full_name:
    selectors:
      - 'input[name="job_application[first_name]"]'
      - 'input#first_name'
      - 'input[autocomplete="given-name"]'
  resume_upload:
    selectors:
      - 'input[type="file"][name*="resume"]'
      - 'input[type="file"]'
submit_button:
  selectors:
    - 'button[type="submit"]'
    - 'input[type="submit"]'
```

### 5.4 Failure Paths

| Failure | Detection | Response |
|---------|-----------|----------|
| CAPTCHA | DOM contains known CAPTCHA selectors or iframe sources. | Apply `A5_CAPTCHA_STRATEGY`. |
| Selector chain miss | Every selector in the chain returns null. | Apply `A5_SELECTOR_STRATEGY` fallback. |
| Network error | Playwright throws or page 5xx. | Retry with backoff (config-driven), then mark failed. |
| Daily cap reached | Counter in SQLite for current UTC day reaches `A5_DAILY_CAP`. | Emit `DailyCapReachedEvent`, stop processing. |
| Match score below gate | `match_score < A5_MIN_MATCH_SCORE`. | Emit `ApplicationSkippedEvent` with reason `below_gate`. Do not open browser. |
| Kill switch tripped | File `apps/job-agent/.killswitch` exists. | Refuse to start. Emit `KillSwitchTrippedEvent`. |

### 5.5 State and Idempotency

A5 keeps no in-memory state across runs. Every fact lives in:

1. SQLite (`apps/job-agent/data/applications.db`): per-application row with status, timestamps, evidence paths.
2. JSONL audit log (`apps/job-agent/outputs/applications.jsonl`): append-only, one event per line.
3. Browser profile directory (if `persistent_profile`): cookies and local storage only.

Before submitting any job, A5 checks SQLite for an existing row with the same `application_id`. If found and `outcome=submitted`, A5 skips and emits `ApplicationSkippedEvent` with reason `already_submitted`.

---

## 6. Implementation Phases

### Phase 2.1, Foundation (1 to 2 days)

1. Add `auto_apply` block to `apps/job-agent/config/settings.json` with all variables from section 4.
2. Define event contracts as Pydantic schemas under `apps/job-agent/contracts/events.py`.
3. Stub the agent class `AutoApplyAgent` under `apps/job-agent/agents/a5_auto_apply.py`. Subscribe to `ApplicationReadyEvent`. No browser yet, just logs receipt.
4. Wire SQLite migration for the `applications` table.

Exit criteria: A4 emits `ApplicationReadyEvent`, A5 logs it, no errors.

### Phase 2.2, Single ATS happy path (2 to 3 days)

1. Implement `BrowserSession` with Playwright, supporting `persistent_profile` first.
2. Author `selectors/greenhouse.yaml` for the five most common Greenhouse fields.
3. Implement `FormFiller` with the YAML loader.
4. Implement `SubmissionAuditor` with screenshot capture and JSONL writer.
5. End-to-end test against one real Greenhouse posting in `assisted_review` mode.

Exit criteria: One real Greenhouse application submitted with a clean audit trail and the user's approval click.

### Phase 2.3, Multi-ATS and threshold mode (2 to 3 days)

1. Add `selectors/lever.yaml` and `selectors/ashby.yaml`.
2. Implement `threshold_auto` mode with the daily cap counter and score gate.
3. Implement CAPTCHA detection module.
4. Implement the kill switch file check.

Exit criteria: A5 submits on three ATS platforms in `threshold_auto` and respects all gates.

### Phase 2.4, LLM selector fallback (1 to 2 days)

Only build this once 2.1 to 2.3 are stable.

1. Implement `LLMSelectorResolver` that asks Claude to inspect a DOM snapshot and return a selector for a named field.
2. Wire it as the fallback in `hybrid` mode.

Exit criteria: When `selectors/<ats>.yaml` is incomplete or stale, A5 still completes the form on at least 70% of attempts.

### Phase 2.5, LinkedIn and Upwork (defer, high risk)

Both platforms actively detect automation. Treat these as separate sub-projects with their own risk review. Do not build until A5 is stable on three ATS platforms and the user accepts the ban risk in writing.

---

## 7. Code Standards (inherited from core_memory.json)

1. No hardcoded values. Every threshold, URL, selector, timeout, file path comes from config.
2. No global mutable state. `BrowserSession`, `FormFiller`, `SubmissionAuditor` are instantiated per-application.
3. Dependency injection. The agent receives its modules via constructor.
4. Typed errors. Custom exception classes per failure mode (`SelectorChainBroken`, `CaptchaDetected`, `DailyCapReached`).
5. Structured logging. Levels: ERROR, WARN, INFO, DEBUG. Log transitions only.
6. Comments explain WHY, not WHAT.
7. Tests follow BDD/AAA. No em-dashes anywhere in code or docs.

---

## 8. Observability

Every A5 run emits a single audit record with the following shape, written to every configured sink in `A5_AUDIT_SINKS`:

```json
{
  "application_id": "uuid",
  "job_url": "string",
  "ats": "string",
  "match_score": 0.83,
  "outcome": "submitted",
  "started_at": "iso8601",
  "completed_at": "iso8601",
  "duration_ms": 12450,
  "selectors_used": { "full_name": "input#first_name", "resume_upload": "input[type=file]" },
  "selectors_failed": [],
  "screenshots": ["path/before_submit.png", "path/after_submit.png"],
  "agent_version": "0.1.0",
  "session_strategy": "persistent_profile"
}
```

This is the format the future ForgeDashboard will consume.

---

## 9. Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Account ban on LinkedIn or Upwork | High | Defer those platforms. Start with ATS only. Use human-like delays from config. |
| Selector drift on ATS pages | Medium | Selector chain with three fallbacks per field, plus LLM resolver. |
| CAPTCHA blocks every submission | Medium | `pause_notify` mode by default. User intervenes. |
| Hallucinated form values from A3 | Medium | A5 logs every value before submit. Audit log is queryable. |
| Daily cap accidentally too high | Low | Cap is in config. Hard-coded ceiling of 50 in code. |
| Kill switch forgotten | Low | Documented in README. Checked on every run start. |

---

## 10. Success Criteria

A5 is considered shipped when, on a fresh checkout:

1. The user runs `python -m apps.job_agent.run` once.
2. A1 through A4 process at least one real job from a configured source.
3. A5 receives the `ApplicationReadyEvent`.
4. A5 submits to at least one Greenhouse posting in `assisted_review` mode.
5. The audit record lands in both SQLite and `outputs/applications.jsonl`.
6. The screenshots are present on disk.
7. No hardcoded values exist in any A5 source file (verified by grep).

---

## 11. Open Questions for the Wizard

These are the questions the user must answer before Claude Code can scaffold A5. They mirror section 4 and exist here for the wizard to lock.

1. Autonomy mode for launch?
2. Target sources, in priority order?
3. Daily cap?
4. Match score gate?
5. CAPTCHA strategy?
6. Audit sinks, how many?
7. Session strategy?
8. Trigger event name from A4?
9. Selector strategy?
10. Document source for resume and cover letter?
11. Hard rules and blocklist?

Once answered, this PRD addendum becomes the locked decision artifact. Claude Code receives it, scans the existing repo, and scaffolds Phase 2.1 only. No phase skipping.
