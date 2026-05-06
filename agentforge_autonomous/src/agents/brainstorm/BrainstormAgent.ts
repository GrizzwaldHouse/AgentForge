/**
 * BrainstormAgent — generates a structured brainstorm artifact for a project.
 *
 * Uses deterministic template generation (no external HTTP calls, no LLM dependency).
 * Falls back gracefully when no backend is available.
 *
 * Input context:
 *   projectDescription  string (required) — one-sentence project description
 *   theme               string (optional) — defaults to "game_dev_arcade"
 */

import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type {
  BrainstormArtifact,
  BrainstormSection,
  BrainstormQuestion,
  BrainstormOption,
  QuestionType,
} from "./types";

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

/**
 * Derive a kebab-case slug from the first 5 words of a string.
 * Each word is lowercased and all non-alphanumeric characters are stripped.
 */
function toProjectSlug(description: string): string {
  return description
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .join("-");
}

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

function opt(
  id: string,
  label: string,
  rationale: string,
  locked = false
): BrainstormOption {
  return { id, label, rationale, locked };
}

function question(
  id: string,
  text: string,
  type: QuestionType,
  options: BrainstormOption[]
): BrainstormQuestion {
  return { id, text, type, options };
}

// ---------------------------------------------------------------------------
// Template sections
// ---------------------------------------------------------------------------

function buildTechStackSection(): BrainstormSection {
  return {
    id: "tech-stack",
    title: "Tech Stack & Engine",
    questions: [
      question("ts-1", "Which primary language / runtime will be used?", "single", [
        opt("ts-1-a", "TypeScript / Node.js", "Broad ecosystem, easy hiring; adds build step."),
        opt("ts-1-b", "C++ (Unreal Engine)", "Maximum performance; steeper learning curve."),
        opt("ts-1-c", "C# (Unity)", "Rapid prototyping; runtime licensing costs."),
        opt("ts-1-d", "GDScript (Godot)", "Free & open-source; smaller community."),
      ]),
      question("ts-2", "Which rendering approach suits the project?", "single", [
        opt("ts-2-a", "2D sprites / canvas", "Fast iteration; limited 3D fidelity."),
        opt("ts-2-b", "3D real-time (forward)", "Immersive visuals; heavier GPU load."),
        opt("ts-2-c", "3D deferred rendering", "Best visual quality; high VRAM cost."),
        opt("ts-2-d", "Procedural / text-based", "Infinite variety; no art assets needed."),
      ]),
      question("ts-3", "How will state / save data be persisted?", "single", [
        opt("ts-3-a", "Local file (JSON / binary)", "No server cost; single-device only."),
        opt("ts-3-b", "Cloud DB (Supabase / Firebase)", "Cross-device sync; privacy obligations."),
        opt("ts-3-c", "In-memory only (session)", "Zero setup; data lost on exit."),
      ]),
      question("ts-4", "Priority: performance vs. development speed (1 = perf, 5 = dev speed)", "numeric_scale", [
        opt("ts-4-1", "1 – Maximum performance", "Squeeze every frame; long dev cycles."),
        opt("ts-4-2", "2", "Lean toward perf; some shortcuts allowed."),
        opt("ts-4-3", "3 – Balanced", "Ship fast AND run well; requires discipline."),
        opt("ts-4-4", "4", "Lean toward speed; some perf debt acceptable."),
        opt("ts-4-5", "5 – Maximum dev speed", "Prototype fast; may need rewrite later."),
      ]),
    ],
  };
}

function buildAudienceSection(): BrainstormSection {
  return {
    id: "audience",
    title: "Target Audience & Platform",
    questions: [
      question("au-1", "Primary platform target", "multi", [
        opt("au-1-a", "Desktop (Windows / Mac / Linux)", "Largest install base; no mobile constraints."),
        opt("au-1-b", "Mobile (iOS / Android)", "Huge audience; 30% store cut, smaller screens."),
        opt("au-1-c", "Browser / WebGL", "No install friction; performance ceiling lower."),
        opt("au-1-d", "Console (PS5 / Xbox)", "Premium audience; expensive certification."),
      ]),
      question("au-2", "Core audience age bracket", "single", [
        opt("au-2-a", "Under 13 (kids)", "Large market; strict COPPA / GDPR-K rules."),
        opt("au-2-b", "13–25 (teens / young adult)", "High engagement; competitive space."),
        opt("au-2-c", "26–40 (millennial)", "Disposable income; nostalgia-driven."),
        opt("au-2-d", "40+ (mature)", "Underserved niche; lower churn."),
      ]),
      question("au-3", "Will the project require multiplayer / online features?", "true_false", [
        opt("au-3-t", "True", "Increases engagement; major infrastructure cost."),
        opt("au-3-f", "False", "Simpler scope; offline-first revenue harder."),
      ]),
      question("au-4", "Rank these audience acquisition channels (drag to order)", "ranked", [
        opt("au-4-a", "Organic / word-of-mouth", "No cost; slow growth."),
        opt("au-4-b", "Social media (TikTok / YouTube)", "Fast reach; algorithm-dependent."),
        opt("au-4-c", "Paid ads", "Predictable reach; eats margin."),
        opt("au-4-d", "Streaming / content creators", "Viral potential; hard to control."),
        opt("au-4-e", "App store featuring", "High conversion; requires platform relationship."),
      ]),
    ],
  };
}

function buildMvpScopeSection(): BrainstormSection {
  return {
    id: "mvp-scope",
    title: "MVP Scope & Feature Priority",
    questions: [
      question("mv-1", "What defines the MVP for this project?", "single", [
        opt("mv-1-a", "Core gameplay loop only", "Ship fast; risk of feeling bare."),
        opt("mv-1-b", "Core loop + one meta system", "Balanced scope; good for early feedback."),
        opt("mv-1-c", "Full feature set minus polish", "More complete; longer time-to-market."),
        opt("mv-1-d", "Playable demo / vertical slice", "Investor / portfolio focused; limited reusability."),
      ]),
      question("mv-2", "Which features are must-haves for launch?", "multi", [
        opt("mv-2-a", "Progression / leveling system", "Retention driver; design-heavy."),
        opt("mv-2-b", "Leaderboards", "Social proof; needs backend infra."),
        opt("mv-2-c", "Achievements", "Replayability; minimal extra content needed."),
        opt("mv-2-d", "In-app purchases / monetization", "Revenue from day one; can alienate players."),
        opt("mv-2-e", "Accessibility options", "Wider audience; small implementation cost."),
      ]),
      question("mv-3", "Estimated time to playable prototype", "single", [
        opt("mv-3-a", "< 1 week", "Aggressive; limits scope to skeleton only."),
        opt("mv-3-b", "1–2 weeks", "Reasonable for solo / small team."),
        opt("mv-3-c", "1 month", "Includes basic polish; realistic for part-time dev."),
        opt("mv-3-d", "> 1 month", "Full feature set targeted; high risk of scope creep."),
      ]),
      question("mv-4", "Match each feature to its priority tier", "abc_match", [
        opt("mv-4-a", "Core loop → P0 (must ship)", "No game without it; zero negotiation."),
        opt("mv-4-b", "Save system → P1 (should ship)", "Players expect it; can stub initially."),
        opt("mv-4-c", "Leaderboard → P2 (nice to have)", "Adds retention; cut if time is short."),
        opt("mv-4-d", "Modding support → P3 (future)", "Long-tail value; post-launch only."),
      ]),
    ],
  };
}

function buildConstraintsSection(): BrainstormSection {
  return {
    id: "constraints",
    title: "Constraints & Risks",
    questions: [
      question("co-1", "What is the primary constraint on this project?", "single", [
        opt("co-1-a", "Time (part-time dev, < 15 hrs/week)", "Requires ruthless scope control; automation helps."),
        opt("co-1-b", "Budget (< $100/month infra)", "Free-tier services first; limits scale."),
        opt("co-1-c", "Team size (solo)", "No blockers; no redundancy if sick/blocked."),
        opt("co-1-d", "Technical complexity", "Needs spikes early; risk of design-lock."),
      ]),
      question("co-2", "Does this project handle user data subject to privacy law?", "true_false", [
        opt("co-2-t", "True", "GDPR / CCPA compliance required; legal cost non-zero."),
        opt("co-2-f", "False", "Simpler; confirm no PII is stored at all."),
      ]),
      question("co-3", "Top risks (rank most → least likely to derail the project)", "ranked", [
        opt("co-3-a", "Scope creep", "Most common failure mode; mitigation: locked MVP list."),
        opt("co-3-b", "Technical debt spiral", "Slows velocity over time; mitigation: weekly refactor."),
        opt("co-3-c", "Motivation / burnout", "Real for solo devs; mitigation: short milestones."),
        opt("co-3-d", "Market / player interest mismatch", "Ship early, validate fast."),
        opt("co-3-e", "Infrastructure cost overrun", "Monitor daily budget; kill switch ready."),
      ]),
      question("co-4", "Rate confidence in the current tech-stack choice (1–5)", "numeric_scale", [
        opt("co-4-1", "1 – Very uncertain", "Need a spike / prototype before committing."),
        opt("co-4-2", "2 – Somewhat uncertain", "One or two unknowns remain."),
        opt("co-4-3", "3 – Neutral", "Familiar but untested at this scale."),
        opt("co-4-4", "4 – Confident", "Proven in prior projects."),
        opt("co-4-5", "5 – Very confident", "Production-battle-tested; no surprises expected."),
      ]),
    ],
  };
}

function buildMonetizationSection(): BrainstormSection {
  return {
    id: "monetization",
    title: "Monetization & Revenue",
    questions: [
      question("mo-1", "Primary revenue model", "single", [
        opt("mo-1-a", "Premium (one-time purchase)", "Simple; revenue front-loaded."),
        opt("mo-1-b", "Free-to-play + IAP", "Large audience; design must avoid pay-to-win."),
        opt("mo-1-c", "Subscription", "Predictable MRR; churn risk."),
        opt("mo-1-d", "Ads-supported", "Passive revenue; degrades experience."),
        opt("mo-1-e", "Portfolio / showcase (no revenue)", "Career value; zero monetization overhead."),
      ]),
      question("mo-2", "Revenue target for Q1 post-launch", "single", [
        opt("mo-2-a", "< $500 / month", "Realistic for indie; covers hosting costs."),
        opt("mo-2-b", "$500 – $1 000 / month", "Part-time income supplement."),
        opt("mo-2-c", "$1 000 – $3 000 / month", "Matches stated Q1-Q2 goals."),
        opt("mo-2-d", "> $3 000 / month", "Full-time income; requires significant marketing."),
      ]),
      question("mo-3", "Will LLM / AI features be part of the product?", "true_false", [
        opt("mo-3-t", "True", "Adds differentiation; increases variable cost per user."),
        opt("mo-3-f", "False", "Lower cost; less differentiation."),
      ]),
    ],
  };
}

// ---------------------------------------------------------------------------
// BrainstormAgent
// ---------------------------------------------------------------------------

export class BrainstormAgent implements Agent {
  id = "brainstorm-agent";
  name = "Brainstorm Agent";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const { context } = input;

    // --- Validate projectDescription ---
    if (
      !("projectDescription" in context) ||
      typeof context.projectDescription !== "string" ||
      context.projectDescription.trim() === ""
    ) {
      return {
        success: false,
        logs: [
          "projectDescription is required and must be a non-empty string",
        ],
      };
    }

    const projectDescription = (context.projectDescription as string).trim();
    const theme =
      typeof context.theme === "string" && context.theme.trim() !== ""
        ? context.theme.trim()
        : "game_dev_arcade";

    const projectSlug = toProjectSlug(projectDescription);
    const capturedAt = new Date().toISOString();

    // --- Build artifact ---
    const sections: BrainstormSection[] = [
      buildTechStackSection(),
      buildAudienceSection(),
      buildMvpScopeSection(),
      buildConstraintsSection(),
      buildMonetizationSection(),
    ];

    const totalQuestions = sections.reduce(
      (sum, s) => sum + s.questions.length,
      0
    );

    const artifact: BrainstormArtifact = {
      title: `${projectDescription} — Brainstorm`,
      theme,
      sections,
      metadata: {
        capturedAt,
        projectSlug,
      },
    };

    return {
      success: true,
      data: artifact,
      logs: [
        `Brainstorm artifact generated: ${sections.length} sections, ${totalQuestions} questions`,
        `Theme: ${theme}`,
        `Slug: ${projectSlug}`,
      ],
    };
  }
}
