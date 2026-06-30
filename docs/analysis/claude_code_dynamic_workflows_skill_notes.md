# Claude Code Dynamic Workflows — Skill Notes

Concepts extracted from Nate Herk's video and mapped to AgentForge patterns.

---

## Decision Table: Which Pattern to Use

| Task Shape | Best Pattern | AgentForge Organ |
|---|---|---|
| One-off question or small edit | Ask Claude Code directly | — |
| Repeatable instruction pattern | Skill (`/skill-name`) | Skeletal (contracts, docs) |
| Isolated side task, no shared state | Subagent | Lymphatic (observability) |
| Small group needs shared context | Agent Team | Brain (knowledge graph) |
| Loop until a done condition | `/goal` | Heart (orchestrator DSL) |
| Wide parallel audit or migration | Dynamic Workflow | Heart + Nervous System |

---

## Cost Signals: When Workflows Are Worth It

A dynamic workflow is justified only when ALL five criteria are true:

1. **Independently parallelizable** — work units do not depend on each other
2. **Enough units to justify fan-out** — at least 5–10 distinct pieces
3. **Bounded scope** — target file set or list is known and finite
4. **Clear synthesis output** — a defined deliverable emerges from combining results
5. **User is aware of token cost** — explicit acknowledgment before launch

If any criterion is false, route to a cheaper pattern (skill, subagent, or `/goal`).

---

## AgentForge Mapping

| Concept from Video | AgentForge Equivalent |
|---|---|
| Dynamic workflow orchestrator | `SupervisorOrchestrator.ts` (Heart) |
| Agent fan-out | EventBus emit → multiple listeners (Nervous System) |
| Parallel execution | Multiple agents registered on same event type |
| Synthesis step | Aggregation agent listening for all `AGENT_COMPLETED` events |
| Cost gate / kill switch | Safety layer (Skin) |
| Skill files | `docs/AGENTFORGE_SKILLS.md` entries |

---

## Key Architectural Alignment

The video's dynamic workflow pattern maps directly to AgentForge's event-driven rules:

- **No polling** — workflows fan out via events, not loops
- **No direct agent calls** — agents emit events; other agents listen
- **Config-driven** — workflow definitions live in `prompts/AGENTFORGE_WORKFLOWS.md`, not hardcoded
- **Bounded budget** — daily $1.00 LLM budget enforced; dynamic workflows must check remaining budget before spawning

---

## Reuse Checklist Before Launching a Dynamic Workflow

Before approving a dynamic workflow in AgentForge, verify:

- [ ] Can the work split into 5+ independent units?
- [ ] Is the target list finite and known?
- [ ] Does a cheaper pattern (skill, subagent, `/goal`) not solve it?
- [ ] Is a synthesis output defined?
- [ ] Has remaining daily token budget been checked?
- [ ] Has a kill-switch handler been registered on the EventBus?
