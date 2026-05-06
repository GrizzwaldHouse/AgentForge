import { describe, it, expect, beforeEach } from "vitest";
import { ObservableOrchestrator } from "@/backend/services/ObservableOrchestrator";
import { SimulatedBackend } from "@/backend/execution/SimulatedBackend";
import { createAgents } from "@/agents/registry";
import { killSwitch } from "@/safety/kill-switch";

describe("SafetyGuard integration with ObservableOrchestrator", () => {
  let backend: SimulatedBackend;

  beforeEach(() => {
    backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });
    // Ensure kill switch is off before each test
    if (killSwitch.isActive()) {
      killSwitch.deactivate();
    }
  });

  it("allows execution when safety is enabled and kill switch is off", async () => {
    const agents = createAgents(backend);
    const orch = new ObservableOrchestrator(agents, { safetyEnabled: true });

    const result = await orch.run("safety-test-1", {
      description: "test task",
      projectDescription: "test task",
      command: "status",
    });
    const succeeded = result.agentResults.filter((r) => r.success).length;

    expect(succeeded).toBe(agents.length);
  });

  it("blocks all agents when kill switch is active", async () => {
    killSwitch.activate();

    const agents = createAgents(backend);
    const orch = new ObservableOrchestrator(agents, { safetyEnabled: true });

    const result = await orch.run("safety-test-2", { description: "test task" });
    const blocked = result.agentResults.filter((r) => !r.success).length;

    expect(blocked).toBe(agents.length);

    // Cleanup
    killSwitch.deactivate();
  });

  it("skips safety check when safetyEnabled is false", async () => {
    killSwitch.activate();

    const agents = createAgents(backend);
    const orch = new ObservableOrchestrator(agents, { safetyEnabled: false });

    const result = await orch.run("safety-test-3", {
      description: "test task",
      projectDescription: "test task",
      command: "status",
    });
    const succeeded = result.agentResults.filter((r) => r.success).length;

    expect(succeeded).toBe(agents.length);

    killSwitch.deactivate();
  });

  it("reports correct timing even when safety blocks agents", async () => {
    killSwitch.activate();

    const agents = createAgents(backend);
    const orch = new ObservableOrchestrator(agents, { safetyEnabled: true });

    const result = await orch.run("safety-test-4", { description: "test" });

    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
    for (const ar of result.agentResults) {
      expect(ar.durationMs).toBeGreaterThanOrEqual(0);
    }

    killSwitch.deactivate();
  });
});
