/**
 * BrainstormAgent — TDD test suite.
 * Written BEFORE the implementation (Red phase).
 */
import { describe, it, expect } from "vitest";
import type { AgentInput } from "@/core/interfaces/Agent";
import { BrainstormAgent } from "../brainstorm/BrainstormAgent";
import type { BrainstormArtifact, QuestionType } from "../brainstorm/types";

const ALLOWED_QUESTION_TYPES: QuestionType[] = [
  "single",
  "multi",
  "true_false",
  "ranked",
  "numeric_scale",
  "abc_match",
];

describe("BrainstormAgent", () => {
  it("agent id is brainstorm-agent", () => {
    const agent = new BrainstormAgent();
    expect(agent.id).toBe("brainstorm-agent");
  });

  it("agent name is Brainstorm Agent", () => {
    const agent = new BrainstormAgent();
    expect(agent.name).toBe("Brainstorm Agent");
  });

  it("returns success:true with artifact when projectDescription provided", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-1",
      context: { projectDescription: "A top-down arcade shooter with power-ups and leaderboards" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("returns success:false with descriptive log when projectDescription missing", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-2",
      context: {},
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(false);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs[0]).toMatch(/projectDescription/i);
  });

  it("returns success:false when projectDescription is empty string", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-3",
      context: { projectDescription: "" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(false);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs[0]).toMatch(/projectDescription/i);
  });

  it("artifact has at least 4 sections", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-4",
      context: { projectDescription: "A multiplayer survival game with crafting and base building" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    expect(artifact.sections.length).toBeGreaterThanOrEqual(4);
  });

  it("each section has at least 3 questions", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-5",
      context: { projectDescription: "A mobile puzzle platformer with procedural levels" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    for (const section of artifact.sections) {
      expect(section.questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each question type is one of the 6 allowed values", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-6",
      context: { projectDescription: "A retro side-scrolling beat-em-up with unlockable characters" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    for (const section of artifact.sections) {
      for (const question of section.questions) {
        expect(ALLOWED_QUESTION_TYPES).toContain(question.type);
      }
    }
  });

  it("theme defaults to game_dev_arcade when not provided", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-7",
      context: { projectDescription: "A space exploration roguelike with permadeath" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    expect(artifact.theme).toBe("game_dev_arcade");
  });

  it("theme is used when provided in context", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-8",
      context: {
        projectDescription: "A revenue automation tool for freelancers",
        theme: "saas_productivity",
      },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    expect(artifact.theme).toBe("saas_productivity");
  });

  it("projectSlug is kebab-case derived from projectDescription first 5 words", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-9",
      context: { projectDescription: "A top-down arcade shooter with power-ups and leaderboards" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    const artifact = result.data as BrainstormArtifact;
    // First 5 words: "A", "top-down", "arcade", "shooter", "with"
    // lowercased, special chars stripped from each word, joined with hyphens
    expect(artifact.metadata.projectSlug).toBe("a-topdown-arcade-shooter-with");
  });

  it("logs array contains expected messages", async () => {
    const agent = new BrainstormAgent();
    const input: AgentInput = {
      taskId: "brainstorm-test-10",
      context: { projectDescription: "A casual mobile game with daily challenges" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.logs.length).toBeGreaterThanOrEqual(3);
    expect(result.logs[0]).toMatch(/Brainstorm artifact generated/i);
    expect(result.logs[1]).toMatch(/Theme:/i);
    expect(result.logs[2]).toMatch(/Slug:/i);
  });
});
