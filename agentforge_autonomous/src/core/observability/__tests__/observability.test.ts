import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "../logger";
import { createTraceContext, childSpan, createTraceId, createSpanId } from "../trace";

describe("TraceContext", () => {
  it("creates unique trace IDs", () => {
    // Act
    const a = createTraceId();
    const b = createTraceId();

    // Assert
    expect(a).toMatch(/^trace_/);
    expect(b).toMatch(/^trace_/);
    expect(a).not.toBe(b);
  });

  it("creates unique span IDs", () => {
    // Act
    const a = createSpanId();
    const b = createSpanId();

    // Assert
    expect(a).toMatch(/^span_/);
    expect(a).not.toBe(b);
  });

  it("creates a trace context with all fields", () => {
    // Act
    const ctx = createTraceContext();

    // Assert
    expect(ctx.traceId).toMatch(/^trace_/);
    expect(ctx.spanId).toMatch(/^span_/);
    expect(ctx.parentSpanId).toBeUndefined();
    expect(ctx.startedAt).toBeGreaterThan(0);
  });

  it("creates child spans with parent reference", () => {
    // Arrange
    const parent = createTraceContext();

    // Act
    const child = childSpan(parent);

    // Assert
    expect(child.traceId).toBe(parent.traceId);
    expect(child.parentSpanId).toBe(parent.spanId);
    expect(child.spanId).not.toBe(parent.spanId);
  });
});

describe("StructuredLogger", () => {
  it("calls sinks with log entries", () => {
    // Arrange
    const entries: Array<{ level: string; message: string }> = [];
    logger.addSink((entry) => entries.push({ level: entry.level, message: entry.message }));

    // Act
    logger.info("test message");

    // Assert
    const last = entries[entries.length - 1];
    expect(last.level).toBe("INFO");
    expect(last.message).toBe("test message");
  });

  it("includes trace context in log entries", () => {
    // Arrange
    const entries: Array<{ traceId?: string; agentId?: string }> = [];
    logger.addSink((entry) =>
      entries.push({ traceId: entry.traceId, agentId: entry.agentId }),
    );
    const trace = createTraceContext();

    // Act
    logger.info("traced", { trace, agentId: "planner" });

    // Assert
    const last = entries[entries.length - 1];
    expect(last.traceId).toBe(trace.traceId);
    expect(last.agentId).toBe("planner");
  });

  it("respects log level filtering", () => {
    // Arrange
    const entries: string[] = [];
    logger.addSink((entry) => entries.push(entry.message));
    logger.setLevel("WARN");
    const beforeCount = entries.length;

    // Act
    logger.debug("should be filtered");
    logger.info("also filtered");
    logger.warn("should appear");
    logger.error("also appears");

    // Assert — only WARN and ERROR should pass through
    const added = entries.slice(beforeCount);
    expect(added).toContain("should appear");
    expect(added).toContain("also appears");
    expect(added).not.toContain("should be filtered");
    expect(added).not.toContain("also filtered");

    // Reset for other tests
    logger.setLevel("INFO");
  });
});
