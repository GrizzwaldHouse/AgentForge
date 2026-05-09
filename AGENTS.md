# Codex Agent Instructions

## Global Code Standard

For all code written, reviewed, or modified in this repository, apply `$human-code-documentation-standards` together with `$universal-coding-standards`.

Use clear human explanations. Document every function with its purpose, parameters, return values, and important usage notes so future game developers, designers, and maintainers can understand and safely use the code.

## Product Source Of Truth

Use `docs/prd/PRD_v3_FULL.md` as the canonical AgentForge product requirements document.

Older PRDs are historical references only. Do not create new issues, implementation plans, or agent prompts from older PRD files unless the canonical PRD explicitly references them.

## MVP Rule

Keep MVP work focused on the revenue workflow:

1. Discover a job or client opportunity.
2. Score it against Marcus's profile and business goals.
3. Generate a proposal or response draft.
4. Show task state, reasoning, safety status, and output in the UI.
5. Require Marcus approval before external submission.
6. Log the run for review, debugging, and future reuse.

Do not add broad AI OS features, 3D generation, Gmail automation, multi-tenant dashboards, payments, or mobile work until the MVP workflow is stable and verified.
