import { spawn } from "child_process";
import fs from "fs";
import { getEnvConfig } from "@/config/env";

/**
 * Strip characters that could inject shell args into the Python subprocess.
 * spawn() is used without shell:true, but sanitizing user input is defence-in-depth.
 */
function sanitizeMessage(msg: string): string {
  return msg.replace(/[`$();|&<>'"\\]/g, "").slice(0, 500);
}

export type PipelineCommand =
  | "validate"
  | "build"
  | "sync"
  | "full"
  | "status"
  | "dashboard-state";

export interface PipelineResult {
  success: boolean;
  output: string;
  exitCode: number;
  durationMs: number;
}

const PIPELINE_TIMEOUT_MS = 120_000;

export async function runPipelineCommand(
  command: PipelineCommand,
  args: string[] = []
): Promise<PipelineResult> {
  const pipelinePath = process.env.PIPELINE_PATH;
  if (!pipelinePath) {
    return {
      success: false,
      output: "PIPELINE_PATH env var is not set — cannot locate pipeline.py",
      exitCode: 1,
      durationMs: 0,
    };
  }

  if (!fs.existsSync(pipelinePath)) {
    return { success: false, output: `PIPELINE_PATH file not found: ${pipelinePath}`, exitCode: 1, durationMs: 0 };
  }

  const startMs = Date.now();
  // -X utf8 ensures emoji in pipeline output doesn't crash on Windows cp1252 consoles
  // sanitizeMessage applied to all user-supplied args (defence-in-depth even without shell:true)
  const sanitizedArgs = args.map(sanitizeMessage);
  const allArgs = ["-X", "utf8", pipelinePath, command, ...sanitizedArgs];

  return new Promise((resolve) => {
    const chunks: string[] = [];
    let timedOut = false;

    const child = spawn("py", allArgs, {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, PIPELINE_TIMEOUT_MS);

    child.stdout.on("data", (d: Buffer) => chunks.push(d.toString()));
    child.stderr.on("data", (d: Buffer) => chunks.push(d.toString()));

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        success: !timedOut && code === 0,
        output: timedOut
          ? `Pipeline timed out after ${PIPELINE_TIMEOUT_MS / 1000}s\n` + chunks.join("")
          : chunks.join(""),
        exitCode: timedOut ? -1 : (code ?? -1),
        durationMs: Date.now() - startMs,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        output: `Failed to spawn pipeline process: ${err.message}`,
        exitCode: -1,
        durationMs: Date.now() - startMs,
      });
    });
  });
}
