import { access, mkdir } from "fs/promises";
import { join, basename } from "path";
import type { Agent, AgentInput, AgentOutput } from "@/core/interfaces/Agent";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { loadConfig, resolveOutputPath } from "../../../apps/job-agent/config/config-loader";
import type {
  VmockUploadCompleteEvent,
  VmockScoredEvent,
  ResumeFailedEvent,
} from "./resume-pipeline-events";

/**
 * VmockRunnerAgent (A5b)
 *
 * Uploads a resume to VMock via Playwright, pastes the job description,
 * waits for the score to render, extracts the score and feedback items,
 * takes an evidence screenshot, and emits vmock.scored (or resume.failed
 * on any unrecoverable error).
 *
 * Auth: Loads a saved Playwright storageState from config.resume.authStatePath.
 * If the auth file is missing, falls back to an unauthenticated session
 * (which will fail at the VMock login wall -- run setup-vmock-auth.mjs first).
 *
 * Selectors: All DOM selectors come from config.resume.vmockSelectors.
 * Marcus must replace the placeholder selectors after inspecting VMock live.
 */
export class VmockRunnerAgent implements Agent {
  id = "vmock-runner-agent";
  name = "VMock Runner Agent (A5b)";

  /**
   * Execute the VMock upload and scoring flow for a single resume iteration.
   *
   * @param input.context.jobId - Unique job identifier (slug form)
   * @param input.context.resumePath - Absolute path to the .docx resume file
   * @param input.context.jdText - Raw job description text to paste into VMock
   * @param input.context.iterationNumber - Which iteration this is (1-based)
   * @returns AgentOutput with success flag, data.score (0-100), data.feedback
   *          (string[]), and data.screenshotPath
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const config = loadConfig();
    const logs: string[] = [];
    const now = new Date().toISOString();

    const jobId = input.context.jobId as string;
    const resumePath = input.context.resumePath as string;
    const jdText = input.context.jdText as string;
    const iterationNumber = (input.context.iterationNumber as number) ?? 1;

    if (!jobId || !resumePath || !jdText) {
      return {
        success: false,
        logs: ["A5b: Missing required context: jobId, resumePath, jdText"],
      };
    }

    // Verify the resume file exists before launching the browser
    try {
      await access(resumePath);
    } catch {
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: `Resume file not accessible: ${resumePath}`,
        lastScore: 0,
        failedAt: now,
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [`A5b: Resume file not found: ${resumePath}`] };
    }

    const screenshotDir = resolveOutputPath(join(config.resume.screenshotDir, jobId));
    await mkdir(screenshotDir, { recursive: true });

    const screenshotPath = join(
      screenshotDir,
      `vmock-score-v${iterationNumber}-${Date.now()}.png`
    );

    const selectors = config.resume.vmockSelectors;
    const authStatePath = resolveOutputPath(config.resume.authStatePath);

    logs.push(`A5b: Launching Playwright for job ${jobId} iteration ${iterationNumber}`);

    let score: number;
    let feedback: string[];

    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });

      // Attempt to restore prior session; fall back to fresh context if missing
      let context;
      try {
        context = await browser.newContext({ storageState: authStatePath });
      } catch {
        logs.push("A5b: Warning: auth state not found, launching without session");
        context = await browser.newContext();
      }

      const page = await context.newPage();

      await page.goto("https://www.vmock.com", { waitUntil: "networkidle" });
      logs.push("A5b: Navigated to VMock");

      // Upload resume file via the configured file input selector
      await page.setInputFiles(selectors.fileInput, resumePath);
      logs.push(`A5b: Uploaded ${basename(resumePath)}`);

      // Notify observers that the upload completed before waiting for score
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit({
        type: "vmock.upload_complete",
        jobId,
        resumePath,
        iterationNumber,
        uploadedAt: new Date().toISOString(),
      } satisfies VmockUploadCompleteEvent);

      // Paste job description and submit
      await page.fill(selectors.jdTextarea, jdText.slice(0, 3000));
      await page.click(selectors.submitButton);
      logs.push("A5b: Submitted JD and resume, waiting for score...");

      // VMock scoring can take up to 2 minutes on their servers
      await page.waitForSelector(selectors.scoreElement, { timeout: 120_000 });

      const rawScore = await page.textContent(selectors.scoreElement);
      score = Math.min(100, Math.max(0, parseInt(rawScore?.trim() ?? "0", 10)));
      logs.push(`A5b: VMock score: ${score}`);

      const feedbackElements = await page.querySelectorAll(selectors.feedbackItems);
      feedback = await Promise.all(
        feedbackElements.map((el) => el.textContent().then((t) => t?.trim() ?? ""))
      );
      feedback = feedback.filter(Boolean).slice(0, 10);
      logs.push(`A5b: ${feedback.length} feedback item(s) extracted`);

      await page.screenshot({ path: screenshotPath, fullPage: false });
      logs.push(`A5b: Screenshot saved to ${screenshotPath}`);

      await context.close();
      await browser.close();
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      const evt: ResumeFailedEvent = {
        type: "resume.failed",
        jobId,
        reason: `Playwright failed: ${error}`,
        lastScore: 0,
        failedAt: new Date().toISOString(),
      };
      (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(evt);
      return { success: false, logs: [...logs, `A5b: Playwright error: ${error}`] };
    }

    const scoredEvent: VmockScoredEvent = {
      type: "vmock.scored",
      jobId,
      score,
      feedback,
      screenshotPath,
      iterationNumber,
      scoredAt: new Date().toISOString(),
    };
    (agentEventBus as unknown as { emit: (e: unknown) => void }).emit(scoredEvent);
    logs.push(`A5b: Emitted vmock.scored (score ${score})`);

    return {
      success: true,
      data: { score, feedback, screenshotPath },
      logs,
    };
  }
}
