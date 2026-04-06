import { describe, it, expect } from "vitest";
import { SimulatedBackend } from "../SimulatedBackend";
import { ExecutionError } from "../ExecutionBackend";

describe("SimulatedBackend", () => {
  const backend = new SimulatedBackend({ type: "simulated", timeoutMs: 10 });

  it("executes a task and returns success", async () => {
    // Arrange
    const task = { id: "test-1", context: {} };
    const input = { taskId: "test-1", context: { foo: "bar" } };

    // Act
    const result = await backend.execute(task, input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]).toContain("test-1");
    expect(result.data).toMatchObject({ taskId: "test-1", simulated: true });
  });

  it("tracks task status through lifecycle", async () => {
    // Arrange
    const task = { id: "status-test", context: {} };
    const input = { taskId: "status-test", context: {} };

    // Act — before execution
    expect(backend.status("status-test")).toBe("pending");

    await backend.execute(task, input);

    // Assert — after execution
    expect(backend.status("status-test")).toBe("completed");
  });

  it("throws ExecutionError when task ID is empty", async () => {
    // Arrange
    const task = { id: "", context: {} };
    const input = { taskId: "", context: {} };

    // Act & Assert
    await expect(backend.execute(task, input)).rejects.toThrow(ExecutionError);
    await expect(backend.execute(task, input)).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });

  it("supports cancellation", async () => {
    // Arrange
    const slowBackend = new SimulatedBackend({ type: "simulated", timeoutMs: 5000 });
    const task = { id: "cancel-test", context: {} };
    const input = { taskId: "cancel-test", context: {} };

    // Act — start execution and immediately cancel
    const promise = slowBackend.execute(task, input);
    slowBackend.cancel("cancel-test");

    // Assert
    await expect(promise).rejects.toThrow(ExecutionError);
    expect(slowBackend.status("cancel-test")).toBe("cancelled");
  });

  it("reports type as simulated", () => {
    // Assert
    expect(backend.type).toBe("simulated");
  });
});
