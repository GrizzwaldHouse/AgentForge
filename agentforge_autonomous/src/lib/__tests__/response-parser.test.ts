import { describe, it, expect } from "vitest";
import { extractJSON, parseResponse, ParseError } from "@/lib/response-parser";

// --- extractJSON ---

describe("extractJSON", () => {
  it("parses raw JSON string", () => {
    const result = extractJSON('{"steps": [], "summary": "hello"}');
    expect(result).toEqual({ steps: [], summary: "hello" });
  });

  it("extracts JSON from markdown code fence", () => {
    const input = 'Here is the plan:\n```json\n{"steps": [1,2,3], "summary": "test"}\n```\nDone.';
    const result = extractJSON(input);
    expect(result).toEqual({ steps: [1, 2, 3], summary: "test" });
  });

  it("extracts JSON from plain code fence", () => {
    const input = '```\n{"key": "value"}\n```';
    const result = extractJSON(input);
    expect(result).toEqual({ key: "value" });
  });

  it("extracts JSON embedded in prose", () => {
    const input = 'The result is {"approved": true, "issues": []} and that is final.';
    const result = extractJSON(input);
    expect(result).toEqual({ approved: true, issues: [] });
  });

  it("handles nested braces", () => {
    const input = '{"outer": {"inner": "value"}, "list": [1, 2]}';
    const result = extractJSON(input);
    expect(result).toEqual({ outer: { inner: "value" }, list: [1, 2] });
  });

  it("handles strings with escaped quotes", () => {
    const input = '{"message": "He said \\"hello\\""}';
    const result = extractJSON(input);
    expect(result).toEqual({ message: 'He said "hello"' });
  });

  it("returns null for empty string", () => {
    expect(extractJSON("")).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(extractJSON(null)).toBeNull();
    expect(extractJSON(undefined)).toBeNull();
  });

  it("returns null for arrays", () => {
    expect(extractJSON([1, 2, 3])).toBeNull();
  });

  it("returns null for non-JSON string", () => {
    expect(extractJSON("This is just plain text with no JSON")).toBeNull();
  });

  it("passes through plain objects", () => {
    const obj = { foo: "bar" };
    expect(extractJSON(obj)).toEqual({ foo: "bar" });
  });

  it("returns null for numbers", () => {
    expect(extractJSON(42)).toBeNull();
  });
});

// --- parseResponse ---

describe("parseResponse", () => {
  it("parses valid JSON and applies defaults", () => {
    const result = parseResponse(
      '{"summary": "done", "steps": [{"id": 1, "action": "test"}]}',
      ["summary", "steps"],
      { summary: "default", steps: [], estimatedFiles: [] },
    );
    expect(result.summary).toBe("done");
    expect(result.steps).toHaveLength(1);
    expect(result.estimatedFiles).toEqual([]);
  });

  it("returns defaults when JSON extraction fails", () => {
    const result = parseResponse(
      "This is not JSON at all",
      ["summary"],
      { summary: "fallback", steps: [] },
    );
    // Default summary wins when explicitly provided
    expect(result.summary).toBe("fallback");
    expect(result.steps).toEqual([]);
  });

  it("uses raw text as summary when no default summary provided", () => {
    const result = parseResponse(
      "This is not JSON at all",
      ["summary"],
      { steps: [] },
    );
    expect(result.summary).toBe("This is not JSON at all");
  });

  it("fills missing required fields with defaults", () => {
    const result = parseResponse(
      '{"summary": "partial"}',
      ["summary", "steps"],
      { summary: "default", steps: [] },
    );
    expect(result.summary).toBe("partial");
    expect(result.steps).toEqual([]);
  });

  it("handles null input", () => {
    const result = parseResponse(
      null,
      ["summary"],
      { summary: "no input" },
    );
    expect(result.summary).toBe("no input");
  });

  it("preserves extra fields from LLM response", () => {
    const result = parseResponse(
      '{"summary": "test", "extraField": true}',
      ["summary"],
      { summary: "default" },
    );
    expect(result.summary).toBe("test");
    expect((result as Record<string, unknown>).extraField).toBe(true);
  });
});
