/**
 * ResponseParser — Extracts and validates structured JSON from LLM responses.
 *
 * LLMs often wrap JSON in markdown code fences or mix it with prose.
 * This module robustly extracts the JSON object regardless of wrapper text.
 */

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly raw: unknown,
  ) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * Extract a JSON object from an LLM response string.
 *
 * Handles:
 *   - Raw JSON
 *   - JSON inside ```json ... ``` fences
 *   - JSON inside ``` ... ``` fences
 *   - JSON embedded in prose (finds first { ... } pair)
 *
 * @returns The parsed object, or null if no JSON found
 */
export function extractJSON(raw: unknown): Record<string, unknown> | null {
  if (raw === null || raw === undefined) return null;

  // Already an object — pass through
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }

  if (typeof raw !== "string") return null;

  const text = raw.trim();
  if (text.length === 0) return null;

  // 1. Try direct parse
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // continue to other strategies
  }

  // 2. Try extracting from code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // continue
    }
  }

  // 3. Find the first balanced { ... } in the text
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) return null;

  // Walk from the first brace and find the matching closing brace
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) {
      const candidate = text.slice(firstBrace, i + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Extract the response string from an unknown AgentOutput.data value.
 * Backend data is either { response: string } or a raw string/object.
 */
export function extractBackendResponse(data: unknown): unknown {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if ("response" in obj) return obj["response"];
  }
  return data;
}

/**
 * Parse and validate an LLM response against expected fields.
 *
 * @param raw - The raw LLM response (string or object)
 * @param requiredFields - Fields that must exist in the parsed output
 * @param defaults - Default values for missing optional fields
 * @returns Validated object with defaults applied
 */
export function parseResponse<T extends object>(
  raw: unknown,
  requiredFields: string[],
  defaults: Partial<T>,
): T {
  const parsed = extractJSON(raw);

  if (!parsed) {
    // Return defaults with raw text as summary if possible
    const fallback = { ...defaults } as Record<string, unknown>;
    if (typeof raw === "string" && raw.trim().length > 0) {
      fallback.summary = fallback.summary ?? raw.trim().slice(0, 200);
    }
    return fallback as T;
  }

  // Apply defaults for any missing fields
  const result = { ...defaults, ...parsed } as Record<string, unknown>;

  // Validate required fields exist
  for (const field of requiredFields) {
    if (result[field] === undefined || result[field] === null) {
      result[field] = defaults[field as keyof typeof defaults] ?? null;
    }
  }

  return result as T;
}
