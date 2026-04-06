import { describe, it, expect, beforeEach } from "vitest";
import type { AgentInput } from "@/core/interfaces/Agent";
import type { ExecutionBackend } from "@/backend/execution/ExecutionBackend";
import { SimulatedBackend } from "@/backend/execution/SimulatedBackend";
import { PlannerAgent } from "../planner/PlannerAgent";
import { BuilderAgent } from "../builder/BuilderAgent";
import { ReviewerAgent } from "../reviewer/ReviewerAgent";
import { TesterAgent } from "../tester/TesterAgent";
import { LearningAgent } from "../learning/LearningAgent";
import { ContextManagerAgent } from "../context/ContextManagerAgent";
import { createAgents } from "../registry";

// Shared backend for tests
let backend: ExecutionBackend;

beforeEach(() => {
  backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });
});

const baseInput: AgentInput = {
  taskId: "test-task-1",
  context: { description: "Build a login page" },
};

// --- PlannerAgent ---

describe("PlannerAgent", () => {
  it("constructs a prompt containing the task description", async () => {
    const agent = new PlannerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.prompt).toContain("PlannerAgent");
    expect(result.data.prompt).toContain("Build a login page");
  });

  it("works without a backend (prompt-only mode)", async () => {
    const agent = new PlannerAgent();
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.plan).toBeNull();
    expect(result.logs).toContain("No backend configured — returning prompt-only output");
  });

  it("parses simulated backend response", async () => {
    const agent = new PlannerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.plan).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(1);
  });

  it("has correct id and name", () => {
    const agent = new PlannerAgent();
    expect(agent.id).toBe("planner");
    expect(agent.name).toBe("PlannerAgent");
  });
});

// --- BuilderAgent ---

describe("BuilderAgent", () => {
  it("constructs a prompt from a plan", async () => {
    const agent = new BuilderAgent(backend);
    const input: AgentInput = {
      taskId: "test-task-2",
      context: { plan: { steps: [{ action: "create file" }] } },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.prompt).toContain("BuilderAgent");
    expect(result.data.prompt).toContain("create file");
  });

  it("works without a backend", async () => {
    const agent = new BuilderAgent();
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.build).toBeNull();
  });

  it("has correct id and name", () => {
    const agent = new BuilderAgent();
    expect(agent.id).toBe("builder");
    expect(agent.name).toBe("BuilderAgent");
  });
});

// --- ReviewerAgent ---

describe("ReviewerAgent", () => {
  it("constructs a prompt from code input", async () => {
    const agent = new ReviewerAgent(backend);
    const input: AgentInput = {
      taskId: "test-task-3",
      context: { code: "function hello() { return 'world'; }" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.prompt).toContain("ReviewerAgent");
    expect(result.data.prompt).toContain("hello");
  });

  it("works without a backend", async () => {
    const agent = new ReviewerAgent();
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.review).toBeNull();
  });

  it("has correct id and name", () => {
    const agent = new ReviewerAgent();
    expect(agent.id).toBe("reviewer");
    expect(agent.name).toBe("ReviewerAgent");
  });
});

// --- TesterAgent ---

describe("TesterAgent", () => {
  it("constructs a prompt from code input", async () => {
    const agent = new TesterAgent(backend);
    const input: AgentInput = {
      taskId: "test-task-4",
      context: { code: "export function add(a, b) { return a + b; }" },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.prompt).toContain("TesterAgent");
    expect(result.data.prompt).toContain("add");
  });

  it("works without a backend", async () => {
    const agent = new TesterAgent();
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.testPlan).toBeNull();
  });

  it("has correct id and name", () => {
    const agent = new TesterAgent();
    expect(agent.id).toBe("tester");
    expect(agent.name).toBe("TesterAgent");
  });
});

// --- LearningAgent ---

describe("LearningAgent", () => {
  it("constructs a prompt from pipeline outputs", async () => {
    const agent = new LearningAgent(backend);
    const input: AgentInput = {
      taskId: "test-task-5",
      context: { plan: {}, build: {}, review: {} },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.prompt).toContain("LearningAgent");
  });

  it("works without a backend", async () => {
    const agent = new LearningAgent();
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.learnings).toBeNull();
  });

  it("has correct id and name", () => {
    const agent = new LearningAgent();
    expect(agent.id).toBe("learning");
    expect(agent.name).toBe("LearningAgent");
  });
});

// --- ContextManagerAgent ---

describe("ContextManagerAgent", () => {
  it("prunes duplicate logs", async () => {
    const agent = new ContextManagerAgent();
    const input: AgentInput = {
      taskId: "test-task-6",
      context: { logs: ["a", "a", "b", "b", "c"] },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.logs).toEqual(["a", "b", "c"]);
  });

  it("caps history to 20 entries", async () => {
    const agent = new ContextManagerAgent();
    const history = Array.from({ length: 30 }, (_, i) => `entry-${i}`);
    const input: AgentInput = {
      taskId: "test-task-7",
      context: { history },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect((result.data.history as unknown[]).length).toBe(20);
  });

  it("truncates oversized string values", async () => {
    const agent = new ContextManagerAgent();
    const input: AgentInput = {
      taskId: "test-task-8",
      context: { bigValue: "x".repeat(15_000) },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect((result.data.bigValue as string).length).toBeLessThan(15_000);
    expect((result.data.bigValue as string)).toContain("[truncated]");
  });

  it("handles empty context gracefully", async () => {
    const agent = new ContextManagerAgent();
    const input: AgentInput = { taskId: "test-task-9", context: {} };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.logs).toEqual([]);
    expect(result.data.history).toEqual([]);
  });

  it("has correct id and name", () => {
    const agent = new ContextManagerAgent();
    expect(agent.id).toBe("context");
    expect(agent.name).toBe("ContextManagerAgent");
  });
});

// --- Registry ---

describe("createAgents", () => {
  it("creates 6 agents with backend injection", () => {
    const agents = createAgents(backend);
    expect(agents).toHaveLength(6);
    expect(agents.map((a) => a.id)).toEqual([
      "planner", "builder", "reviewer", "tester", "learning", "context",
    ]);
  });

  it("creates 6 agents without backend", () => {
    const agents = createAgents();
    expect(agents).toHaveLength(6);
  });

  it("all agents execute successfully with simulated backend", async () => {
    const agents = createAgents(backend);
    const results = await Promise.all(
      agents.map((a) => a.execute(baseInput)),
    );

    for (const result of results) {
      expect(result.success).toBe(true);
      expect(result.logs.length).toBeGreaterThan(0);
    }
  });
});
