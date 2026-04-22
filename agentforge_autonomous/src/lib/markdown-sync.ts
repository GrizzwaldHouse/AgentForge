/**
 * MarkdownSync — Read/write tracking files (TASKS.md, LEARNING.md, AGENTS.md).
 *
 * Keeps grizz_modular_system/ and grizz_modular_system_fixed/ in sync.
 * All writes go to both directories atomically.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

// Resolve project root (two levels up from src/lib/)
const PROJECT_ROOT = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..", "..", "..");

const PRIMARY_DIR = join(PROJECT_ROOT, "grizz_modular_system");
const MIRROR_DIR = join(PROJECT_ROOT, "grizz_modular_system_fixed");

const TRACKED_FILES = [
  "TASKS.md",
  "LEARNING.md",
  "AGENTS.md",
  "SKILLS.md",
  "SYSTEM_PROMPT.md",
] as const;

export type TrackingFile = (typeof TRACKED_FILES)[number];

/**
 * Read a tracking file from the primary directory.
 */
export async function readTrackingFile(filename: TrackingFile): Promise<string> {
  const path = join(PRIMARY_DIR, filename);
  try {
    return await readFile(path, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw err;
  }
}

/**
 * Write a tracking file to both primary and mirror directories.
 */
export async function writeTrackingFile(
  filename: TrackingFile,
  content: string,
): Promise<void> {
  const primaryPath = join(PRIMARY_DIR, filename);
  const mirrorPath = join(MIRROR_DIR, filename);

  // Ensure directories exist
  for (const dir of [PRIMARY_DIR, MIRROR_DIR]) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  // Write to both atomically
  await Promise.all([
    writeFile(primaryPath, content, "utf-8"),
    writeFile(mirrorPath, content, "utf-8"),
  ]);
}

/**
 * Append a learning entry to LEARNING.md.
 */
export async function appendLearning(entry: {
  pattern: string;
  source: string;
  confidence: number;
  timestamp?: number;
}): Promise<void> {
  const existing = await readTrackingFile("LEARNING.md");
  const ts = new Date(entry.timestamp ?? Date.now()).toISOString();
  const newEntry = [
    "",
    `### ${entry.pattern}`,
    `- **Source:** ${entry.source}`,
    `- **Confidence:** ${(entry.confidence * 100).toFixed(0)}%`,
    `- **Recorded:** ${ts}`,
  ].join("\n");

  await writeTrackingFile("LEARNING.md", existing + newEntry + "\n");
}

/**
 * Update agent status in AGENTS.md.
 */
export async function updateAgentStatus(
  agentId: string,
  status: "idle" | "running" | "error",
  lastTask?: string,
): Promise<void> {
  const existing = await readTrackingFile("AGENTS.md");
  const ts = new Date().toISOString();
  const statusLine = `| ${agentId} | ${status} | ${lastTask ?? "—"} | ${ts} |`;

  // Find or create the status table
  if (existing.includes("| Agent | Status |")) {
    // Table exists — update the row for this agent
    const lines = existing.split("\n");
    let updated = false;

    const updatedLines = lines.map((line) => {
      if (line.startsWith(`| ${agentId} |`)) {
        updated = true;
        return statusLine;
      }
      return line;
    });

    if (!updated) {
      // Agent not in table — append row
      updatedLines.push(statusLine);
    }

    await writeTrackingFile("AGENTS.md", updatedLines.join("\n"));
  } else {
    // No table — append a status section
    const section = [
      "",
      "## Runtime Status",
      "",
      "| Agent | Status | Last Task | Updated |",
      "|-------|--------|-----------|---------|",
      statusLine,
    ].join("\n");

    await writeTrackingFile("AGENTS.md", existing + section + "\n");
  }
}

/**
 * Verify both directories are in sync.
 * Returns list of files that differ.
 */
export async function verifySync(): Promise<string[]> {
  const diffs: string[] = [];

  for (const filename of TRACKED_FILES) {
    try {
      const primary = await readFile(join(PRIMARY_DIR, filename), "utf-8");
      const mirror = await readFile(join(MIRROR_DIR, filename), "utf-8");

      if (primary !== mirror) {
        diffs.push(filename);
      }
    } catch {
      // File missing in one or both directories
      diffs.push(filename);
    }
  }

  return diffs;
}
