# AgentForge Assisted Job Capture And Evidence-Grounded Tailoring Design

**Status:** Approved direction
**Date:** 2026-05-31
**Owner:** Marcus Daley
**Canonical product requirements:** `AgentForge/docs/prd/PRD_v3_FULL.md`
**Working implementation:** `agentforge_autonomous`

## 1. Purpose

AgentForge needs a practical revenue-first workflow for jobs discovered manually on Upwork, LinkedIn, RemoteOK, Himalayas, and similar sites. Marcus should be able to right-click a job page, send the job to AgentForge, receive a grounded proposal and resume-tailoring report, and fill supported application fields after reviewing the output.

The MVP is an assisted workflow. AgentForge does not click the final submit button, bypass anti-bot controls, solve CAPTCHAs, or fabricate qualifications.

## 2. Approved MVP Experience

1. Marcus opens a job page in Chrome or Edge.
2. Marcus right-clicks the page or selected job text and chooses **Send job to AgentForge**.
3. The browser extension captures the page URL, page title, selected text, visible text, and a timestamp.
4. If useful text cannot be extracted, the extension captures a screenshot and marks the capture as screenshot-first.
5. AgentForge stores the capture, extracts the job requirements, scores the opportunity against verified evidence, and generates:
   - A tailored proposal or cover-letter draft.
   - A resume-tailoring report with safe edits.
   - A keyword report for future job searches.
   - A missing-evidence report for requirements AgentForge cannot truthfully claim.
6. Marcus reviews the output in AgentForge.
7. Marcus chooses **Fill application fields** when the page supports assisted autofill.
8. The extension fills supported text fields, highlights what changed, and leaves the page ready for Marcus to review.
9. Marcus personally clicks the website's submit button.

## 3. Scope Boundaries

### Included

- Chrome and Edge Manifest V3 extension.
- Right-click context-menu capture.
- Selected-text capture and visible-page-text capture.
- Active-tab screenshot fallback.
- Localhost-only AgentForge capture API.
- Resume, approved-profile, and configured-repository evidence indexing.
- Evidence-grounded job matching, proposal drafting, and light resume tailoring.
- Keyword profiles for manual Upwork and LinkedIn searches.
- Assisted field fill with a visible preview and audit log.
- Human submission only.

### Excluded

- Automated final submission.
- Automated LinkedIn or Upwork browsing, scraping loops, or account actions.
- CAPTCHA solving or anti-bot bypass.
- Direct VMock dependency or assumed VMock API integration.
- Fabricated achievements, dates, metrics, certifications, tools, or project claims.
- Fully autonomous resume rewriting.
- Background polling. Extension capture and AgentForge processing remain event-driven.

VMock remains optional. If Marcus exports a VMock report, AgentForge may accept it later as an additional review artifact. The MVP uses AgentForge's own evidence-grounded analysis so the core workflow remains local and reliable.

## 4. Architecture

```text
Job Page
  -> Chrome or Edge Extension
  -> POST localhost AgentForge Capture API
  -> Job Capture Store
  -> Requirement Extractor
  -> Evidence Retriever
  -> Match Scorer
  -> Grounded Draft Generator
  -> Claim Verifier
  -> Review UI
  -> Approved Assisted Fill Request
  -> Extension Field Filler
  -> Marcus Reviews And Clicks Submit
```

### Browser Extension

Add a small Manifest V3 extension under `agentforge_autonomous/apps/browser-extension/`.

The extension owns:

- A context-menu action named **Send job to AgentForge**.
- Page-text capture through a content script.
- Screenshot capture when selected and visible text are missing, too short, or explicitly requested.
- A local message bridge for approved field-fill instructions.
- Field highlighting after fill so Marcus can inspect every inserted value.
- A hard rule that no extension code may click submit controls.

### AgentForge Capture API

Add a localhost API surface under the existing Next.js app.

The capture endpoint accepts:

```ts
interface JobCaptureRequest {
  captureId: string;
  capturedAt: string;
  sourceUrl: string;
  sourceHost: string;
  pageTitle: string;
  selectedText?: string;
  visibleText?: string;
  screenshotDataUrl?: string;
  captureMode: "selected-text" | "visible-text" | "screenshot-first";
}
```

The API returns:

```ts
interface JobCaptureResponse {
  captureId: string;
  jobId: string;
  status: "accepted" | "needs-manual-text" | "rejected";
  reviewUrl?: string;
  reason?: string;
}
```

Captures are stored locally with their source URL, extraction method, screenshot path when present, processing status, and audit timestamps.

### Evidence Ledger

Replace hardcoded resume claims with a local evidence ledger. Each usable claim is stored with a stable evidence ID and one or more sources.

```ts
interface EvidenceClaim {
  evidenceId: string;
  category: "skill" | "experience" | "project" | "education" | "metric" | "credential";
  statement: string;
  keywords: string[];
  sources: EvidenceSource[];
  approvalStatus: "verified" | "manual-review" | "rejected";
}

interface EvidenceSource {
  sourceType: "resume" | "approved-profile" | "repository" | "manual-note";
  sourcePath: string;
  sourceReference: string;
}
```

Repository evidence comes only from configured local repository roots. The indexer reads safe text sources such as README files, tracked documentation, package metadata, and selected source files. It skips secrets, generated folders, build outputs, dependency folders, and untracked archives by default.

### Grounded Drafting And Verification

Draft generation receives the job requirements plus retrieved evidence claims. Every factual sentence in a generated proposal or resume-tailoring suggestion must cite one or more evidence IDs internally.

The claim verifier blocks unsupported factual statements before output reaches the review UI. It classifies each requirement as:

- **Supported:** direct evidence exists and may be used.
- **Adjacent:** related evidence exists, but AgentForge must describe it conservatively.
- **Missing:** no evidence exists, so AgentForge must not claim it.

Light resume tailoring may:

- Reorder verified skills.
- Select the most relevant verified project bullets.
- Emphasize verified experience.
- Suggest truthful wording refinements.
- Produce ATS-style keyword alignment.

Light resume tailoring may not:

- Add a skill, project, credential, metric, or date without evidence.
- Rewrite adjacent experience as direct experience.
- Hide missing requirements.

### Keyword Profile

AgentForge generates a reusable keyword profile from verified evidence:

```ts
interface JobSearchKeywordProfile {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  supportedRoles: string[];
  excludedClaims: string[];
  searchStrings: Array<{
    label: string;
    query: string;
    targetSite: "upwork" | "linkedin" | "generic";
  }>;
}
```

The review UI exposes formatted search strings that Marcus can paste into Upwork or LinkedIn. The profile is generated from verified evidence, not from speculative career targets.

### Assisted Autofill

After Marcus approves a draft in AgentForge, the app sends a fill request to the extension for the active tab.

```ts
interface AssistedFillRequest {
  fillId: string;
  jobId: string;
  approvedAt: string;
  fields: Array<{
    semanticField: "cover-letter" | "proposal" | "resume-keywords" | "screening-answer";
    value: string;
    evidenceIds: string[];
  }>;
}
```

The extension uses site-specific selector mappings where available and a conservative generic textarea fallback. It previews matched fields before writing, highlights filled fields afterward, logs the result, and never activates a submit button.

## 5. Data Flow And Events

The workflow adds event-driven job-assistance events:

```text
job.capture.received
job.capture.extracted
job.evidence.matched
job.draft.generated
job.draft.verification_failed
job.draft.ready_for_review
job.fill.requested
job.fill.completed
job.fill.failed
job.submission.logged_manually
```

Every event includes a task ID, capture ID, job ID, timestamp, source host, status, and relevant audit references. Model/provider details are recorded for AI-assisted stages.

## 6. Safety, Privacy, And Failure Handling

- The extension sends data only to a configured localhost AgentForge origin.
- Screenshots remain local and are never sent to a cloud provider unless Marcus explicitly selects a cloud model for that run.
- The API validates payload size, source host, capture mode, and required fields.
- AgentForge rejects empty captures and requests manual pasted text when screenshot extraction is insufficient.
- Screenshot text extraction uses local OCR first. Cloud vision is allowed only when Marcus explicitly selects a cloud model for that run.
- Screenshot extraction failures do not silently produce drafts. AgentForge requests manual pasted text instead.
- Repository indexing is allowlist-based and excludes secrets and generated content.
- Field fill requires an approved draft and an explicit Marcus action.
- The extension refuses fill requests for a tab whose URL no longer matches the captured job.
- The extension records fill failures without retry loops that could trigger anti-bot systems.
- Final submission remains entirely manual.

## 7. Review UI

Extend the existing jobs surface with a capture review view that shows:

- Captured URL, source host, capture mode, and screenshot preview when present.
- Extracted job title, company, responsibilities, requirements, and keywords.
- Match score with supported, adjacent, and missing evidence sections.
- Proposal editor with evidence references available for inspection.
- Resume-tailoring suggestions grouped as safe reorder, safe wording refinement, and unsupported request.
- Generated Upwork, LinkedIn, and generic search strings.
- **Approve draft** and **Fill application fields** actions.
- Audit history for capture, analysis, approval, and fill events.

## 8. Testing Strategy

### Unit Tests

- Capture payload validation rejects empty or oversized requests.
- Requirement extraction normalizes selected text, visible text, and screenshot-derived text.
- Evidence retrieval returns only allowlisted verified claims.
- Claim verification blocks unsupported generated statements.
- Keyword profiles contain only verified evidence terms.
- Resume tailoring cannot add unsupported facts.
- Assisted fill selector matching never returns submit controls.

### Integration Tests

- Extension fixture sends a selected-text capture to the local API and receives a review URL.
- Extension fixture falls back to a screenshot when page text is unavailable.
- A fake job description produces supported, adjacent, and missing requirement groups.
- A generated proposal with an unsupported claim is blocked before review.
- An approved draft fills a fake Upwork-style proposal textarea and leaves submit untouched.
- An approved draft fills a fake LinkedIn-style cover-letter textarea and leaves submit untouched.
- A changed-tab URL causes fill refusal and an audit event.

### Manual Acceptance Checks

- Right-click a real job page and confirm it appears in AgentForge.
- Capture a blocked or text-light page and confirm screenshot fallback is visible.
- Review a proposal and inspect the evidence behind each factual claim.
- Confirm a missing skill is listed as missing and never inserted into the proposal.
- Fill a supported page and confirm Marcus still performs the final submit click.

## 9. Implementation Slices

1. **Capture foundation:** extension context menu, localhost API, local capture store, minimal functional capture-review page, and fake-page integration test.
2. **Evidence ledger:** resume ingestion, approved-profile ingestion, configured-repository indexing, keyword profile, and claim-source inspection.
3. **Grounded tailoring:** requirement extraction, match scoring, proposal drafting, resume suggestions, and claim-verification gate.
4. **Screenshot fallback:** screenshot capture, local storage, local OCR, explicit cloud-vision opt-in, and manual-text fallback.
5. **Assisted autofill:** selector registry, preview, fill highlighting, URL guard, audit events, and fake Upwork/LinkedIn fixtures.
6. **UI completion:** review page, evidence inspector, keyword search strings, approval control, and fill status history.

## 10. Acceptance Criteria

The MVP is complete when:

- Marcus can right-click a job page and see it appear in AgentForge.
- AgentForge falls back to a local screenshot when page text cannot be captured.
- Proposal and resume suggestions contain only evidence-backed facts.
- Unsupported requirements are visible as gaps and do not appear as claimed experience.
- AgentForge produces formatted keyword search strings from verified evidence.
- Marcus can approve a draft and fill supported application text fields.
- The extension never clicks submit and never bypasses anti-bot controls.
- Audit history records capture, evidence matching, draft verification, approval, and fill outcomes.

## 11. Locked Decisions

- Use a Chrome and Edge Manifest V3 extension for the right-click workflow.
- Use AgentForge's local analysis as the default; treat VMock as an optional later import.
- Keep screenshots local by default.
- Use local OCR first for screenshot text extraction and require explicit opt-in before sending screenshots to a cloud vision provider.
- Use allowlisted local repositories as evidence sources.
- Require evidence IDs behind factual claims.
- Permit only light, truthful resume tailoring.
- Keep LinkedIn and Upwork interactions assisted and user-driven.
- Require Marcus to click the final submit button.
