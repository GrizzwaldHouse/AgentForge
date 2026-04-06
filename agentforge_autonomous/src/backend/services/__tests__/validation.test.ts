import { describe, it, expect } from "vitest";
import { ObservableOrchestrator } from "../ObservableOrchestrator";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";

function createMockAgent(id: string): Agent {
  return {
    id,
    name: `${id}Agent`,
    execute: async (_input: AgentInput): Promise<AgentOutput> => ({
      success: true,
      logs: [`${id} executed`],
      data: null,
    }),
  };
}

describe("Input Validation", () => {
  it("rejects empty agent array", () => {
    expect(() => new ObservableOrchestrator([])).toThrow(
      "ObservableOrchestrator requires at least one agent",
    );
  });

  it("rejects null agent array", () => {
    expect(() => new ObservableOrchestrator(null as unknown as Agent[])).toThrow();
  });

  it("rejects empty taskId", async () => {
    const orch = new ObservableOrchestrator([createMockAgent("a")]);
    await expect(orch.run("", {})).rejects.toThrow("taskId must be a non-empty string");
  });

  it("rejects whitespace-only taskId", async () => {
    const orch = new ObservableOrchestrator([createMockAgent("a")]);
    await expect(orch.run("   ", {})).rejects.toThrow("taskId must be a non-empty string");
  });

  it("rejects non-object context", async () => {
    const orch = new ObservableOrchestrator([createMockAgent("a")]);
    await expect(
      orch.run("task-1", [] as unknown as Record<string, unknown>),
    ).rejects.toThrow("context must be a plain object");
  });

  it("accepts valid inputs", async () => {
    const orch = new ObservableOrchestrator([createMockAgent("a")]);
    const result = await orch.run("valid-task", { key: "value" });
    expect(result.agentResults).toHaveLength(1);
    expect(result.agentResults[0].success).toBe(true);
  });
});
