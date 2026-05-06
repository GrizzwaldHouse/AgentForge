# AgentForge Workflows

Workflow definitions for all three pipelines. Each workflow is defined as a sequence of events, not function calls. Agents listen for events; they do not call each other.

---

## WORKFLOW 1: Find Money (Job Application Pipeline)

**Trigger:** External — OwlWatcher detects new job listing or scheduled scan window

**Event sequence:**

```
JOB_DISCOVERED
  └── A1 Job Ingestion Agent
        Deduplicates by job ID
        Validates required fields
        Stores to /data/jobs/{source}/{jobId}.json
        └── Emits: JOB_MATCHED (if passes initial filter)
                   or: JOB_REJECTED (logged, not forwarded)

JOB_MATCHED
  └── A2 Job Matching Agent
        Loads marcus.profile.json from config
        Scores job against capability profile
        Applies scoring weights from jobs.config.json
        If score >= threshold:
        └── Emits: PROPOSAL_REQUESTED

PROPOSAL_REQUESTED
  └── A3 Proposal Generator
        Checks VRAM via VramWatchdog
        Routes to local Qwen3-Coder-30B or HF Inference fallback
        Loads proposal.template.md
        Customizes with job data and Marcus profile
        Validates output length and quality
        Stores to /output/proposals/{date}/{jobId}.md
        └── Emits: PROPOSAL_GENERATED

PROPOSAL_GENERATED
  └── A4 Output Formatter
        Loads platform format config from jobs.config.json
        Reformats for target platform (Upwork, LinkedIn, email)
        Adds Marcus's signature block
        Stores formatted version alongside raw version
        └── Emits: APPLICATION_READY

APPLICATION_READY
  └── (Phase 2) A9 Deployment Agent
        Reads platform from event payload
        Submits via Playwright MCP or platform API
        Logs result to /output/applications/{date}/{jobId}.json
        └── Emits: APPLICATION_SUBMITTED or APPLICATION_FAILED
```

**Failure handling:**

```
AGENT_ERROR
  └── A5 Token Optimizer / Error Handler
        Logs full error context
        Determines if retry is appropriate
        Switches model if token budget exceeded
        Re-emits original trigger event if retryable
        Alerts to /output/errors/{date}/error-{timestamp}.json
```

---

## WORKFLOW 2: Show Capability (Portfolio Chat Pipeline)

**Trigger:** Visitor sends message to portfolio chat interface

**Phase 2 — not MVS. Defined here for planning purposes.**

```
VISITOR_MESSAGE_RECEIVED
  └── A11 Portfolio Chat Agent
        Classifies intent (technical question, hire inquiry, demo request)
        Routes to appropriate handler

TECHNICAL_QUESTION
  └── Loads relevant project context from /context/projects/
        Calls Qwen3-VL-8B if message includes screenshot
        Calls Qwen3-Coder-30B if message is code-related
        Generates response
        └── Emits: RESPONSE_READY

HIRE_INQUIRY
  └── Loads marcus.profile.json
        Generates personalized pitch
        Attaches portfolio links
        Optionally schedules Calendly link via webhook
        └── Emits: RESPONSE_READY

RESPONSE_READY
  └── A13 Voice Interface Agent (Phase 3)
        Converts text to speech via Kokoro-82M
        Streams audio to frontend
        └── Logs interaction to /output/portfolio-analytics/
```

---

## WORKFLOW 3: Earn Residual (SaaS Packaging Pipeline)

**Trigger:** Marcus marks a working pipeline as PACKAGE_READY

**Phase 3 — not MVS.**

```
PIPELINE_PACKAGE_READY
  └── A15 SaaS Packaging Agent
        Reads pipeline config
        Generates client-facing config schema (no internal details exposed)
        Creates onboarding documentation
        Wraps in Cloudflare Worker deployment
        Sets up Stripe billing tier
        Emits: SAAS_PACKAGE_READY

SAAS_PACKAGE_READY
  └── A9 Deployment Agent
        Deploys to Cloudflare
        Registers in service registry
        Sends welcome email via Resend
        Creates Notion page for client
        Emits: SAAS_DEPLOYED
```

---

## WORKFLOW 4: Veteran Opportunity Scan (Grant and Defense Track)

**Trigger:** Scheduled weekly scan (OwlWatcher timer event)

**Phase 2 — A14 Veteran Grant Scout Agent**

```
VETERAN_SCAN_TRIGGERED
  └── A14 Veteran Grant Scout Agent
        Checks SBA SBIR portal for new solicitations
        Checks Bunker Labs for new programs
        Checks VET TEC status (until confirmed reauthorized)
        Checks DoD contractor job boards (Cubic, General Atomics, Anduril, Shield AI, Booz Allen)
        Checks July 2026 childcare documentation deadline (hard-coded alert until resolved)
        Generates weekly opportunity digest
        Stores to /output/veteran-opportunities/{date}/digest.md
        Emits: OPPORTUNITY_DIGEST_READY

OPPORTUNITY_DIGEST_READY
  └── Delivers to Marcus via Slack webhook or email via Resend
```

---

## VRAM Management Workflow

**Trigger:** VRAM_PRESSURE event or any model load request

```
MODEL_LOAD_REQUESTED
  └── VramWatchdog
        Reads slot config from models.config.json
        Checks nvidia-smi for available VRAM
        If available >= slotBudget + safetyBuffer:
          └── Approves load, emits MODEL_LOAD_APPROVED
        If available < threshold:
          └── Emits VRAM_PRESSURE
              └── InferenceRouter routes to cloud fallback
                  └── Emits MODEL_SWITCHED (logs which model, why)

VRAM_PRESSURE
  └── A5 Token Optimizer
        Logs pressure event
        Checks which slot is under pressure
        If SLOT_A under pressure: unload if idle, reload after cloud task
        If SLOT_B under pressure: defer generation task or queue
```

---

## Supervisor Review Workflow

**Trigger:** PR opened with NEEDS-REVIEW label

```
PR_OPENED (NEEDS-REVIEW)
  └── Supervisor Session reads:
        - All changed files
        - Test results
        - README task table update

      Checks against non-negotiables:
        [ ] No hardcoded values
        [ ] No polling loops
        [ ] Observer pattern used
        [ ] VRAM check present in any inference code
        [ ] Model URLs in comments
        [ ] Tests written and passing
        [ ] Config-driven model selection
        [ ] Scales beyond single user
        [ ] No EM dashes in comments or docs

      If all pass:
        └── Adds SUPERVISOR-APPROVED label
            Updates README task table: status = DONE
            Approves merge

      If any fail:
        └── Adds CHANGES-REQUESTED label
            Comments specific violation with line reference
            Agent must fix before re-review
```

---

*Workflows are the source of truth for agent behavior. If code does not match a workflow, the workflow wins.*
