#!/usr/bin/env node

/**
 * Session Resume Agent
 *
 * Reads ONLY: SESSION_HANDOFF.md, git diff, task-queue.json, memory-index.json
 * Outputs a ready-to-paste Claude Code resume prompt
 *
 * Usage: node scripts/session-resume.mjs
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function readSafe(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

function main() {
  console.log("=== Session Resume Agent ===\n");

  // 1. Read handoff
  const handoff = readSafe(resolve(ROOT, "SESSION_HANDOFF.md"));
  if (!handoff) {
    console.error("No SESSION_HANDOFF.md found. Cannot resume.");
    process.exit(1);
  }

  // 2. Read task queue
  const taskQueueRaw = readSafe(resolve(ROOT, "task-queue.json"));
  const taskQueue = taskQueueRaw ? JSON.parse(taskQueueRaw) : null;

  // 3. Git diff since last commit
  let gitDiff = "";
  try {
    gitDiff = execSync("git diff --stat", { cwd: ROOT, encoding: "utf-8" });
  } catch {
    gitDiff = "(no uncommitted changes)";
  }

  let gitLog = "";
  try {
    gitLog = execSync("git log --oneline -5", { cwd: ROOT, encoding: "utf-8" });
  } catch {
    gitLog = "(no git history)";
  }

  // 4. Find next tasks
  const pendingTasks = taskQueue?.queue?.filter((t) => t.status === "pending") || [];
  const unblockedTasks = pendingTasks.filter((t) => {
    if (!t.blockedBy || t.blockedBy.length === 0) return true;
    const completedIds = taskQueue.queue
      .filter((q) => q.status === "complete")
      .map((q) => q.id);
    return t.blockedBy.every((dep) => completedIds.includes(dep));
  });

  // 5. Check for Ollama-completed work
  const ollamaCompleted = taskQueue?.queue?.filter(
    (t) => t.status === "complete" && t.completedBy === "ollama-resume"
  ) || [];

  // 6. Build resume prompt
  const prompt = `Resume work on SeniorDevBuddy/agentforge_autonomous using the CONTEXT_AWARE_EXECUTION protocol.

Read these files first (DO NOT re-read any file marked "complete" in memory-index.json):
- SESSION_HANDOFF.md
- memory-index.json
- task-queue.json

## Recent Git History
${gitLog}

## Uncommitted Changes
${gitDiff || "(clean working tree)"}

${ollamaCompleted.length > 0 ? `## Ollama Background Work (verify before using)
${ollamaCompleted.map((t) => `- [${t.id}] ${t.title} -> ${t.file}`).join("\n")}
Run build to verify these files compile correctly.
` : ""}
## Next Tasks (${unblockedTasks.length} unblocked)
${unblockedTasks.slice(0, 5).map((t) => `- [${t.id}] ${t.title} (${t.complexity})`).join("\n")}

## Instructions
1. Read SESSION_HANDOFF.md for current state
2. Read memory-index.json — skip files marked complete
3. ${ollamaCompleted.length > 0 ? "Verify Ollama-generated files compile, then continue" : "Start with first unblocked task"}
4. Follow checkpoint protocol from CONTEXT_AWARE_EXECUTION.json`;

  console.log("=== PASTE THIS INTO CLAUDE CODE ===\n");
  console.log(prompt);
  console.log("\n=== END PROMPT ===");
}

main();
