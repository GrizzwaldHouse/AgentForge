import { describe, it, expect, beforeEach } from "vitest";
import { createBackend, ExecutionError, registerBackend } from "../ExecutionBackend";
import type { ExecutionBackend as IExecutionBackend, BackendConfig } from "../ExecutionBackend";

// Import to trigger self-registration
import "../SimulatedBackend";

describe("ExecutionBackend factory", () => {
  it("creates a simulated backend from config", () => {
    // Arrange
    const config: BackendConfig = { type: "simulated" };

    // Act
    const backend = createBackend(config);

    // Assert
    expect(backend.type).toBe("simulated");
  });

  it("throws ExecutionError for unknown backend type", () => {
    // Arrange
    const config = { type: "nonexistent" as any };

    // Act & Assert
    expect(() => createBackend(config)).toThrow(ExecutionError);
    expect(() => createBackend(config)).toThrow("Unknown backend type");
  });

  it("supports custom backend registration", () => {
    // Arrange
    const mockBackend: IExecutionBackend = {
      type: "mock",
      execute: async () => ({ success: true, logs: ["mock"], data: null }),
      cancel: () => {},
      status: () => "pending",
    };
    registerBackend("mock", () => mockBackend);

    // Act
    const backend = createBackend({ type: "mock" });

    // Assert
    expect(backend.type).toBe("mock");
  });
});

describe("ExecutionError", () => {
  it("has correct properties", () => {
    // Arrange & Act
    const err = new ExecutionError("test error", "TIMEOUT", "task-1");

    // Assert
    expect(err.message).toBe("test error");
    expect(err.code).toBe("TIMEOUT");
    expect(err.taskId).toBe("task-1");
    expect(err.name).toBe("ExecutionError");
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves cause", () => {
    // Arrange
    const original = new Error("original");

    // Act
    const err = new ExecutionError("wrapped", "EXECUTION_FAILED", "t-1", original);

    // Assert
    expect(err.cause).toBe(original);
  });
});
