# External Event Ingest Endpoint — Design Spec

**Date:** 2026-07-01
**Status:** Locked (all decisions confirmed 2026-07-01)
**Owner:** Marcus Daley (@GrizzwaldHouse)
**Source prompt:** `C:\ClaudeSkills\skills\agentforge-proof-of-work\BUILD_INGEST_ENDPOINT_PROMPT.md`

---

## What This Document Is

Design for `POST /api/agent/external-event`, a new HTTP endpoint that lets an
external process (a Claude Code session in an unrelated repo, e.g.
`D:\Agent-Alexander\whisper`) push a "here's what I just did" report into
AgentForge's live event bus, so it renders in the dashboard's event log
alongside AgentForge's own internal agent events.

This closes a real gap: today only AgentForge's own in-process orchestration
code can call `agentEventBus.emit()`. There is no way for an outside process
to report finished work into the dashboard.

## Verified Current State (read before implementing — this repo changes over time)

- `src/core/events/agent-event-bus.ts` — singleton `AgentEventBus` with
  `emit()`, `subscribe()`, ring buffer (`MAX_BUFFER = 200`).
- `src/core/events/types.ts` — `AgentEvent` discriminated union on `type`,
  keyed off string constants in `src/lib/constants.ts`'s `EVENT_TYPES`.
- `src/app/api/agent/events/route.ts` — SSE GET route, read-only, streams
  `agentEventBus` subscriptions. **Not modified by this work.**
- `src/lib/progress.ts`'s `deriveProgress()` — drives the pipeline timeline
  widget (`floating-progress.tsx`). It `switch`es on a **fixed, closed** set
  of event types (`session:start/end`, `agent:start/progress/complete/error/paused`)
  with no `default` case. A new event type will **not** move this widget.
- `src/components/event-stream.tsx` — the scrolling log
  panel. Its `formatEvent()` has a `default: return JSON.stringify(event)`
  fallback, so unknown event types already render here without changes.
- `src/app/api/safety/route.ts` + `src/lib/sanitize.ts` — the existing manual
  `typeof`/`Array.isArray` + `sanitizeString().slice(0, N)` validation
  convention. **No zod dependency exists in `package.json`** (confirmed) —
  do not introduce one.
- `src/safety/audit-logger.ts` + `src/safety/types.ts` — `AuditEntry.actionType`
  is a closed `ActionType` enum (`SEND_EMAIL`, `DELETE_FILE`, `AGENT_EXECUTE`,
  etc.) built for the kill-switch/approval flow. None of its values describe
  "accepted an external report" or "rejected: bad token" — reusing it would
  either lie about `actionType` or overload `CUSTOM` with unrelated meaning.
- `src/config/env.ts` — the only place `process.env` should be read from;
  fails fast (throws) on invalid required config, never logs secret values,
  caches after first load. This repo's actual "config convention" — there is
  no repo-level `.env.local`-specific loader beyond Next.js's own built-in
  handling.
- No rate limiting exists anywhere in `src/app/api/` today (verified).
- `docs/HOOK.md` confirms a deliberate zero-dependency bias (no husky,
  lefthook, etc.) — new work should avoid adding npm packages where a small
  local module suffices.

## Decisions Locked This Session

1. **UI scope: event-log only, no pipeline-timeline changes.** The original
   prompt's two goals ("dashboard shows it on the pipeline timeline" and "no
   dashboard UI changes") conflict given `deriveProgress()`'s closed switch.
   Resolved in favor of the stricter constraint: **zero UI file changes.**
   External reports appear in the `EventStream` log panel only, via its
   existing generic fallback rendering. `progress.ts` is not touched.
2. **Audit logging: new dedicated module**, not reuse of `src/safety/audit-logger.ts`.
   A new `src/lib/ingest-audit.ts` follows the same ring-buffer + structured
   `console.log` pattern but with fields that actually describe this
   endpoint's decisions, keeping the safety audit log's meaning (kill
   switch / approvals) uncontaminated by network-ingest concerns.
3. **Missing token → fail closed (503), loudly.** If
   `AGENTFORGE_INGEST_TOKEN` is unset, every request gets `503` — never a
   silent pass-through, never a misleading `401` that implies auth is
   configured but the token was just wrong. On first request received while
   unconfigured, log a single loud `console.error` (not per-request spam) so
   the misconfiguration is impossible to miss in server logs. This mirrors
   (in idiom, not code) the "structured, non-silent" logging philosophy
   pointed to from `github.com/GrizzwaldHouse/StructuredLogging` — that repo
   is a UE5 C++ plugin + Python log server (verified: no TS/Node code, not
   importable here); only the *pattern* — structured, tagged log lines and
   loud config failures instead of quiet ones — carries over, applied in
   this repo's own `[safety-audit]`-style console-line convention.
4. **`details` field: accept opaque JSON, cap serialized size.** The
   `details` payload is caller-defined and open-ended (test counts, commit
   lists, whatever a future caller wants). Validate only that
   `JSON.stringify(details).length` stays under 4 KB (well inside the 8 KB
   total body cap) — do not whitelist or shape-check its internal fields.
5. **Rate limit: 10 requests / minute / IP** (module-level
   `Map<string, {count, resetAt}>`, scoped to this route only, no
   dependency). Sized for milestone-style external reports, not
   high-frequency polling.
6. **Docs location: expand `docs/event_driven_model.md`** (currently a
   2-line stub) with a new `## External Ingest` section, rather than a new
   top-level doc file for a single route.

## New Event Type

`src/lib/constants.ts` — add to `EVENT_TYPES`:

```ts
EXTERNAL_REPORT: "external:report",
```

Deliberately namespaced `external:*` — distinct from `agent:*`, `session:*`,
`pipeline:*` — so external callers can never produce an event whose `type`
matches an internal AgentForge event. This is the core spoofing defense: the
dashboard viewer can always tell "this came from AgentForge's own agents"
apart from "this came from an external report."

`src/core/events/types.ts` — add:

```ts
export interface ExternalReportEvent extends BaseEvent {
  type: typeof EVENT_TYPES.EXTERNAL_REPORT;
  source: string;
  summary: string;
  status: "success" | "failure";
  details?: Record<string, unknown>;
}
```

Add `ExternalReportEvent` to the `AgentEvent` union. `BaseEvent` already
supplies `id`, `timestamp`, `sessionId` — the caller's `sessionId` field maps
directly onto `BaseEvent.sessionId`.

## Request / Response Contract

```
POST /api/agent/external-event
Authorization: Bearer <AGENTFORGE_INGEST_TOKEN>
Content-Type: application/json

{
  "source": "whisper-desktop",
  "sessionId": "codex-dictation-trust-replay",
  "summary": "Trust scoring + replay tooling implemented and reviewed",
  "status": "success",
  "details": { "testsPassed": 26, "testsFailed": 0, "commits": ["af718c7"] }
}
```

Field limits (mirroring `MAX_LENGTHS` conventions in `sanitize.ts`):
`source` ≤ 100 chars, `sessionId` ≤ 200 chars, `summary` ≤ 2000 chars,
`details` ≤ 4 KB serialized. Total request body ≤ 8 KB, checked via
`Content-Length` before parsing and re-checked against actual bytes read.

Responses:

| Status | Meaning |
|---|---|
| 200 | `{ "accepted": true, "eventId": "evt_..." }` |
| 400 | Missing/invalid/oversized field, or malformed JSON |
| 401 | Missing or incorrect `Authorization: Bearer` token |
| 413 | Body exceeds 8 KB |
| 429 | Rate limit exceeded (`Retry-After` header set) |
| 503 | `AGENTFORGE_INGEST_TOKEN` not configured on the server |

The token is **never** accepted as a query parameter (leaks into access
logs / shell history) — header only.

## New Files

- `src/lib/ingest-audit.ts` — dedicated ring-buffer audit log
  (`{timestamp, source, ip, accepted, reason}`), structured `console.log`
  output prefixed `[ingest-audit]`, same shape philosophy as
  `src/safety/audit-logger.ts` but not sharing its `AuditEntry` type.
- `src/lib/ingest-rate-limit.ts` — module-level `Map<string, {count, resetAt}>`
  rate limiter, 10 req/min/IP, no new dependency.
- `src/app/api/agent/external-event/route.ts` — the `POST` handler: reads
  IP, checks rate limit, checks body size, checks bearer token (fail closed
  + one-time loud log if unconfigured), validates fields via manual
  `typeof` checks + `sanitizeString().slice(0, N)` (matching
  `safety/route.ts`'s convention — no zod), constructs one
  `ExternalReportEvent`, calls `agentEventBus.emit(...)`, logs via
  `ingest-audit.ts`, returns the response.
- `src/lib/__tests__/external-event.test.ts` — new test file following the
  `safety-integration.test.ts` pattern: auth rejection (missing/wrong
  token), oversized body rejection, rate-limit trip after 10 requests,
  valid payload emits exactly one `ExternalReportEvent` observable via a
  subscribed bus listener.

## Modified Files

- `src/lib/constants.ts` — add `EXTERNAL_REPORT` to `EVENT_TYPES` (additive).
- `src/core/events/types.ts` — add `ExternalReportEvent`, extend the
  `AgentEvent` union (additive).
- `src/config/env.ts` — add `ingestToken: string | undefined`, sourced from
  `process.env.AGENTFORGE_INGEST_TOKEN`, loaded the same way as the existing
  `agentToken` field (additive).
- `docs/event_driven_model.md` — expand the 2-line stub with an
  `## External Ingest` section documenting the endpoint: request/response
  shape, required header, rate limit numbers, the `external:report` event
  type and why it's namespace-isolated from internal event types.

## Explicitly Out of Scope

- `src/app/api/agent/events/route.ts` (SSE GET route) — untouched.
- Any dashboard UI component — untouched. No pipeline-timeline change.
- Any of AgentForge's internal agent orchestration code — untouched. This
  is a pure addition internal code never needs to call.
- `docs/playwright_layer.md` — still a stub; out of scope for this endpoint
  (it's the next consumer of this endpoint, per the proof-of-work skill,
  not part of building it).

## Manual Verification Plan

1. `npm run dev`.
2. `Invoke-RestMethod` (or curl) a valid payload with the correct bearer
   token → expect `200` and the event visible in the dashboard's event log
   in a real browser.
3. Same payload with missing/wrong token → expect `401`.
4. Oversized payload (>8 KB) → expect `413`.
5. 11 requests in under a minute from the same source → expect the 11th to
   return `429` with `Retry-After`.
6. Unset `AGENTFORGE_INGEST_TOKEN` entirely, restart dev server, POST once →
   expect `503` and exactly one loud `console.error` line in the server log
   (not one per request).
