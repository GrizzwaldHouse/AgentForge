import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { loadConfig } from "../../../apps/job-agent/config/config-loader";
import type { ResumeSelectedEvent, ResumeFailedEvent } from "./resume-pipeline-events";

const ACCEPTED_EXTENSIONS = new Set([".docx", ".pdf"]);

async function embedTexts(
  hfApiBase: string,
  hfModel: string,
  hfToken: string,
  texts: string[]
): Promise<number[][]> {
  const url = `${hfApiBase}/${hfModel}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    throw new Error(`HF API error ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<number[][]>;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class ResumeSelectionAgent implements Agent {
  id = "resume-selection-agent";
  name = "Resume Selection Agent (A5a)";

  async execute(input: AgentInput): Promise<AgentOutput> {
    const config = loadConfig();
    const logs: string[] = [];
    const now = new Date().toISOString();

    const jobId = input.context.jobId as string;
    const jdText = input.context.jdText as string;

    if (!jobId || !jdText) {
      return { success: false, logs: ["A5a: Missing required context: jobId and jdText"] };
    }

    const hfToken = process.env.HF_BEARER_TOKEN ?? "";
    if (!hfToken) {
      logs.push("A5a: Warning: HF_BEARER_TOKEN not set, HF API calls will fail");
    }

    const vaultPath = config.resume.vaultPath;
    const minScore = config.resume.minMatchScore;
    const hfApiBase = config.resume.hfApiBase;
    const hfModel = config.resume.hfMatchModel;

    logs.push(`A5a: Scanning resume vault at ${vaultPath}`);

    let files: string[];
    try {
      const entries = await readdir(vaultPath);
      files = entries.filter((f) => ACCEPTED_EXTENSIONS.has(extname(f).toLowerCase()));
    } catch {
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: `Cannot read resume vault at ${vaultPath}`,
        lastScore: 0,
        failedAt: now,
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [...logs, "A5a: Vault read failed"] };
    }

    if (files.length === 0) {
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: "No resume files found in vault (expected .docx or .pdf)",
        lastScore: 0,
        failedAt: now,
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [...logs, "A5a: No resumes found"] };
    }

    logs.push(`A5a: Found ${files.length} resume(s): ${files.join(", ")}`);

    const resumeTexts: string[] = [];
    for (const file of files) {
      try {
        const buf = await readFile(join(vaultPath, file));
        resumeTexts.push(buf.toString("utf-8").slice(0, 2000));
      } catch {
        resumeTexts.push(file);
      }
    }

    let embeddings: number[][];
    try {
      embeddings = await embedTexts(hfApiBase, hfModel, hfToken, [jdText, ...resumeTexts]);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: `HF embedding failed: ${error}`,
        lastScore: 0,
        failedAt: now,
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [...logs, `A5a: HF API failed: ${error}`] };
    }

    const jdEmbedding = embeddings[0];
    const resumeEmbeddings = embeddings.slice(1);

    let bestIndex = 0;
    let bestScore = -1;
    for (let i = 0; i < resumeEmbeddings.length; i++) {
      const score = cosineSimilarity(jdEmbedding, resumeEmbeddings[i]);
      logs.push(`A5a: ${files[i]} similarity: ${score.toFixed(4)}`);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    logs.push(`A5a: Best match: ${files[bestIndex]} (score ${bestScore.toFixed(4)})`);

    if (bestScore < minScore) {
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: `Best match score ${bestScore.toFixed(4)} is below threshold ${minScore} -- manual review required`,
        lastScore: bestScore,
        failedAt: now,
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [...logs, "A5a: Score below threshold"] };
    }

    const selectedPath = join(vaultPath, files[bestIndex]);
    const evt: ResumeSelectedEvent = {
      type: "resume.selected",
      jobId,
      resumePath: selectedPath,
      matchScore: bestScore,
      selectedAt: now,
    };
    (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
    logs.push(`A5a: Emitted resume.selected for ${files[bestIndex]}`);

    return {
      success: true,
      data: { selectedResumePath: selectedPath, matchScore: bestScore },
      logs,
    };
  }
}
