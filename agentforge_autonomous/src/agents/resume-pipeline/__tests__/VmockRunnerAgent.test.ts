import { describe, it, expect, vi, beforeEach } from "vitest";
import { VmockRunnerAgent } from "../VmockRunnerAgent";
import * as agentEventBusModule from "@/core/events/agent-event-bus";

vi.mock("@/core/events/agent-event-bus", () => ({
  agentEventBus: { emit: vi.fn() },
}));

vi.mock("../../../apps/job-agent/config/config-loader", () => ({
  loadConfig: vi.fn().mockReturnValue({
    resume: {
      vaultPath: "/test/resumes",
      minMatchScore: 0.65,
      vmockPassThreshold: 75,
      maxIterations: 3,
      authStatePath: "agents/A5-auto-apply/vmock-auth.json",
      screenshotDir: "agents/A5-auto-apply/jobs",
      hfMatchModel: "sentence-transformers/all-MiniLM-L6-v2",
      hfApiBase: "https://api-inference.huggingface.co/models",
      vmockSelectors: {
        fileInput: "input[type=file]",
        jdTextarea: "textarea",
        submitButton: "button[type=submit]",
        scoreElement: "[data-testid='score-value']",
        feedbackItems: "[data-testid='feedback-item']",
      },
    },
  }),
  resolveOutputPath: vi.fn((p: string) => `/resolved/${p}`),
}));

// Mock fs/promises for file access and mkdir
vi.mock("fs/promises", () => ({
  access: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Build mock Playwright page, context, and browser
const mockTextContent = vi.fn().mockResolvedValue("88");
const mockQuerySelectorAll = vi.fn().mockResolvedValue([
  { textContent: vi.fn().mockResolvedValue("Add metrics to bullets") },
  { textContent: vi.fn().mockResolvedValue("Use stronger action verbs") },
]);
const mockScreenshot = vi.fn().mockResolvedValue(undefined);
const mockSetInputFiles = vi.fn().mockResolvedValue(undefined);
const mockFill = vi.fn().mockResolvedValue(undefined);
const mockClick = vi.fn().mockResolvedValue(undefined);
const mockWaitForSelector = vi.fn().mockResolvedValue(undefined);
const mockPageGoto = vi.fn().mockResolvedValue(undefined);
const mockContextClose = vi.fn().mockResolvedValue(undefined);
const mockBrowserClose = vi.fn().mockResolvedValue(undefined);
const mockNewPage = vi.fn();
const mockNewContext = vi.fn();
const mockLaunch = vi.fn();

vi.mock("playwright", () => ({
  chromium: { launch: mockLaunch },
}));

describe("VmockRunnerAgent", () => {
  let agent: VmockRunnerAgent;

  beforeEach(() => {
    agent = new VmockRunnerAgent();
    vi.clearAllMocks();

    const mockPage = {
      goto: mockPageGoto,
      setInputFiles: mockSetInputFiles,
      fill: mockFill,
      click: mockClick,
      waitForSelector: mockWaitForSelector,
      textContent: mockTextContent,
      querySelectorAll: mockQuerySelectorAll,
      screenshot: mockScreenshot,
    };

    mockNewPage.mockResolvedValue(mockPage);
    mockNewContext.mockResolvedValue({
      newPage: mockNewPage,
      close: mockContextClose,
    });
    mockLaunch.mockResolvedValue({
      newContext: mockNewContext,
      close: mockBrowserClose,
    });
  });

  it("emits vmock.scored on successful score read", async () => {
    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await agent.execute({
      taskId: "vmock-acme-001",
      context: {
        jobId: "acme-engineer-2026-06-01",
        resumePath: "C:/Users/daley/Resumes/resume-fullstack.docx",
        jdText: "TypeScript engineer with Next.js experience",
        iterationNumber: 1,
      },
    });

    expect(result.success).toBe(true);
    const scoredCall = bus.emit.mock.calls.find(
      ([evt]: [{ type: string }]) => evt.type === "vmock.scored"
    );
    expect(scoredCall).toBeDefined();
    expect(scoredCall[0].score).toBe(88);
    expect(scoredCall[0].jobId).toBe("acme-engineer-2026-06-01");
    expect(scoredCall[0].iterationNumber).toBe(1);
  });

  it("emits resume.failed when resume file not accessible", async () => {
    const { access } = await import("fs/promises");
    vi.mocked(access).mockRejectedValueOnce(new Error("ENOENT"));

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await agent.execute({
      taskId: "vmock-acme-002",
      context: {
        jobId: "acme-engineer-2026-06-01",
        resumePath: "C:/Users/daley/Resumes/nonexistent.docx",
        jdText: "TypeScript engineer",
        iterationNumber: 1,
      },
    });

    expect(result.success).toBe(false);
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "resume.failed" })
    );
  });

  it("includes screenshotPath in vmock.scored event", async () => {
    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    await agent.execute({
      taskId: "vmock-acme-003",
      context: {
        jobId: "acme-engineer-2026-06-01",
        resumePath: "C:/Users/daley/Resumes/resume-fullstack.docx",
        jdText: "TypeScript engineer",
        iterationNumber: 2,
      },
    });

    const scoredCall = bus.emit.mock.calls.find(
      ([evt]: [{ type: string }]) => evt.type === "vmock.scored"
    );
    expect(scoredCall).toBeDefined();
    expect(scoredCall[0].screenshotPath).toContain("vmock-score-v2");
  });
});
