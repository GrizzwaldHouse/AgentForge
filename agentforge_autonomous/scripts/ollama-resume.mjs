#!/usr/bin/env node

/**
 * Ollama Resume Agent
 *
 * Reads SESSION_HANDOFF.md + task-queue.json + git diff
 * Sends context to local Ollama for background continuation
 * Only handles ollamaEligible tasks (simple boilerplate/generation)
 *
 * Usage: node scripts/ollama-resume.mjs [--dry-run] [--model llama3.3:70b]
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL_PREFERENCE = ["llama3.3:70b", "glm-4.7-flash", "llama3:8b"];

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const modelArg = args.find((a) => a.startsWith("--model="))?.split("=")[1];

async function main() {
  console.log("=== Ollama Resume Agent ===\n");

  // 1. Read handoff + task queue
  const handoff = readSafe(resolve(ROOT, "SESSION_HANDOFF.md"));
  const taskQueue = JSON.parse(readSafe(resolve(ROOT, "task-queue.json")) || "{}");

  if (!handoff || !taskQueue.queue) {
    console.error("Missing SESSION_HANDOFF.md or task-queue.json — nothing to resume.");
    process.exit(1);
  }

  // 2. Get git diff for recent context
  let gitDiff = "";
  try {
    gitDiff = execSync("git diff HEAD~1 --stat", { cwd: ROOT, encoding: "utf-8" });
  } catch {
    gitDiff = "(no git history available)";
  }

  // 3. Find eligible tasks
  const eligible = taskQueue.queue.filter(
    (t) => t.status === "pending" && t.ollamaEligible && (!t.blockedBy || t.blockedBy.length === 0)
  );

  if (eligible.length === 0) {
    // Check if any blocked tasks have completed dependencies
    const completedIds = taskQueue.queue
      .filter((t) => t.status === "complete")
      .map((t) => t.id);

    const newlyUnblocked = taskQueue.queue.filter(
      (t) =>
        t.status === "pending" &&
        t.ollamaEligible &&
        t.blockedBy?.every((dep) => completedIds.includes(dep))
    );

    if (newlyUnblocked.length === 0) {
      console.log("No Ollama-eligible unblocked tasks. Waiting for Claude Code session.");
      process.exit(0);
    }

    eligible.push(...newlyUnblocked);
  }

  console.log(`Found ${eligible.length} eligible task(s):\n`);
  eligible.forEach((t) => console.log(`  [${t.id}] ${t.title} (${t.complexity})`));

  if (dryRun) {
    console.log("\n--dry-run: would process above tasks. Exiting.");
    process.exit(0);
  }

  // 4. Check Ollama availability + select model
  const model = modelArg || (await selectModel());
  if (!model) {
    console.error("No Ollama model available. Is Ollama running?");
    process.exit(1);
  }
  console.log(`\nUsing model: ${model}\n`);

  // 5. Process first eligible task only (conservative)
  const task = eligible[0];
  console.log(`Processing: [${task.id}] ${task.title}`);

  const prompt = buildPrompt(task, handoff, gitDiff, taskQueue);

  if (dryRun) {
    console.log("\nPrompt would be:\n", prompt.slice(0, 500), "...");
    process.exit(0);
  }

  const response = await queryOllama(model, prompt);

  if (response && task.file) {
    const filePath = resolve(ROOT, task.file);
    writeFileSync(filePath, response, "utf-8");
    console.log(`Wrote: ${task.file}`);

    // Update task queue
    task.status = "complete";
    task.completedBy = "ollama-resume";
    task.completedAt = new Date().toISOString();
    writeFileSync(
      resolve(ROOT, "task-queue.json"),
      JSON.stringify(taskQueue, null, 2),
      "utf-8"
    );
    console.log("Updated task-queue.json");
  }

  console.log("\n=== Done ===");
}

function readSafe(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

async function selectModel() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = await res.json();
    const available = data.models?.map((m) => m.name) || [];

    for (const preferred of MODEL_PREFERENCE) {
      if (available.includes(preferred)) return preferred;
    }
    return available[0] || null;
  } catch {
    return null;
  }
}

function buildPrompt(task, handoff, gitDiff, taskQueue) {
  const memoryIndex = readSafe(resolve(ROOT, "memory-index.json")) || "{}";

  return `You are a code generation assistant. Generate ONLY the file content requested — no explanation, no markdown fences, just the TypeScript code.

## Project Context (from SESSION_HANDOFF.md)
${handoff.slice(0, 2000)}

## Recent Changes (git diff --stat)
${gitDiff.slice(0, 500)}

## File Inventory (relevant exports)
${extractRelevantExports(memoryIndex, task)}

## Task
ID: ${task.id}
Title: ${task.title}
Target file: ${task.file}
Complexity: ${task.complexity}

## Instructions
Generate the complete TypeScript file for: ${task.file}
Follow the existing patterns in the codebase (strict TypeScript, ES Modules, @/ path aliases).
Use only imports from files listed in the file inventory.
Output ONLY the file content. No explanations.`;
}

function extractRelevantExports(memoryJson, task) {
  try {
    const mem = JSON.parse(memoryJson);
    const deps = task.blockedBy || [];
    const relevant = Object.entries(mem.files || {})
      .filter(([, v]) => v.status === "complete")
      .map(([k, v]) => `${k}: exports [${(v.exports || []).join(", ")}]`)
      .join("\n");
    return relevant || "(no exports indexed)";
  } catch {
    return "(memory index not available)";
  }
}

async function queryOllama(model, prompt) {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 4096 },
      }),
    });
    const data = await res.json();
    let response = data.response || "";

    // Strip markdown fences if model added them
    response = response.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();

    return response;
  } catch (err) {
    console.error("Ollama query failed:", err.message);
    return null;
  }
}

main().catch(console.error);
