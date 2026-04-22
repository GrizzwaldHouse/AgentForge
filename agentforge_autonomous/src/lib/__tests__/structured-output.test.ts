import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import type { ExecutionBackend, BackendConfig, TaskStatus } from "@/backend/execution/ExecutionBackend";
import type { Task } from "@/core/entities/Task";
import { PlannerAgent } from "@/agents/planner/PlannerAgent";
import { BuilderAgent } from "@/agents/builder/BuilderAgent";
import { ReviewerAgent } from "@/agents/reviewer/ReviewerAgent";
import { TesterAgent } from "@/agents/tester/TesterAgent";
import { LearningAgent } from "@/agents/learning/LearningAgent";

/**
 * Mock backend that returns configurable LLM responses.
 * Used to test structured output parsing without a real LLM.
 */
class MockLLMBackend implements ExecutionBackend {
  readonly type = "mock" as const;
  constructor(private response: string) {}

  async execute(task: Task, input: AgentInput): Promise<AgentOutput> {
    return {
      success: true,
      logs: ["[mock] response delivered"],
      data: { response: this.response },
    };
  }

  cancel(): void {}
  status(): TaskStatus { return "completed"; }
}

const baseInput: AgentInput = {
  taskId: "test-structured-1",
  context: { description: "Build a login page with OAuth support" },
};

// --- PlannerAgent structured output ---

describe("PlannerAgent structured output", () => {
  it("parses well-formed JSON response", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      steps: [
        { id: 1, action: "Create auth module", details: "Set up OAuth flow" },
        { id: 2, action: "Build login UI", details: "React component with form" },
      ],
      summary: "OAuth login implementation plan",
      estimatedFiles: ["src/auth/oauth.ts", "src/components/LoginForm.tsx"],
    }));

    const agent = new PlannerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.plan.steps).toHaveLength(2);
    expect(result.data.plan.summary).toBe("OAuth login implementation plan");
    expect(result.data.plan.estimatedFiles).toHaveLength(2);
  });

  it("handles JSON wrapped in markdown code fence", async () => {
    const backend = new MockLLMBackend(
      'Here is the plan:\n```json\n{"steps": [{"id": 1, "action": "test", "details": "test"}], "summary": "fenced plan", "estimatedFiles": []}\n```',
    );

    const agent = new PlannerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.plan.summary).toBe("fenced plan");
  });

  it("falls back to defaults on unparseable response", async () => {
    const backend = new MockLLMBackend("I cannot produce valid JSON right now.");

    const agent = new PlannerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    // Should get defaults with raw text as summary
    expect(result.data.plan.steps).toEqual([]);
    expect(result.data.plan.summary).toBeDefined();
  });
});

// --- BuilderAgent structured output ---

describe("BuilderAgent structured output", () => {
  it("parses file generation response", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      files: [
        { path: "src/auth.ts", content: "export class Auth {}", action: "create" },
      ],
      summary: "Created auth module",
    }));

    const agent = new BuilderAgent(backend);
    const input: AgentInput = {
      taskId: "test-build-1",
      context: { plan: { steps: [{ action: "create auth" }] } },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.build.files).toHaveLength(1);
    expect(result.data.build.files[0].path).toBe("src/auth.ts");
    expect(result.data.build.summary).toBe("Created auth module");
  });

  it("handles empty files array gracefully", async () => {
    const backend = new MockLLMBackend('{"files": [], "summary": "No changes needed"}');

    const agent = new BuilderAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.build.files).toEqual([]);
  });
});

// --- ReviewerAgent structured output ---

describe("ReviewerAgent structured output", () => {
  it("parses review with issues", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      issues: [
        { severity: "critical", file: "auth.ts", line: 42, message: "SQL injection risk" },
        { severity: "warning", file: "auth.ts", line: 10, message: "Missing type annotation" },
      ],
      approved: false,
      summary: "Critical security issue found",
    }));

    const agent = new ReviewerAgent(backend);
    const input: AgentInput = {
      taskId: "test-review-1",
      context: { build: { files: [{ path: "auth.ts", content: "code" }] } },
    };
    const result = await agent.execute(input);

    expect(result.success).toBe(true);
    expect(result.data.review.approved).toBe(false);
    expect(result.data.review.issues).toHaveLength(2);
    expect(result.data.review.issues[0].severity).toBe("critical");
  });

  it("parses clean review (no issues)", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      issues: [],
      approved: true,
      summary: "Code looks good",
    }));

    const agent = new ReviewerAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.review.approved).toBe(true);
    expect(result.data.review.issues).toEqual([]);
  });
});

// --- TesterAgent structured output ---

describe("TesterAgent structured output", () => {
  it("parses test generation response", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      tests: [
        { name: "should login with valid creds", file: "auth.test.ts", type: "unit", code: "it('test', () => {})" },
      ],
      coverage: { estimated: 85, notes: "Covers happy path" },
      summary: "1 unit test generated",
    }));

    const agent = new TesterAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.testPlan.tests).toHaveLength(1);
    expect(result.data.testPlan.coverage.estimated).toBe(85);
  });
});

// --- LearningAgent structured output ---

describe("LearningAgent structured output", () => {
  it("parses pattern extraction response", async () => {
    const backend = new MockLLMBackend(JSON.stringify({
      patterns: [
        { pattern: "Use dependency injection", source: "BuilderAgent", confidence: 0.9 },
      ],
      antiPatterns: [
        { pattern: "Hardcoded credentials", reason: "Security risk" },
      ],
      recommendations: ["Add input validation at boundaries"],
      summary: "1 pattern, 1 anti-pattern found",
    }));

    const agent = new LearningAgent(backend);
    const result = await agent.execute(baseInput);

    expect(result.success).toBe(true);
    expect(result.data.learnings.patterns).toHaveLength(1);
    expect(result.data.learnings.antiPatterns).toHaveLength(1);
    expect(result.data.learnings.recommendations).toHaveLength(1);
  });
});
