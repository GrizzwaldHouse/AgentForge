import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResumePipelineOrchestrator } from "../ResumePipelineOrchestrator";
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
}));

const mockSelectorExecute = vi.fn();
const mockRunnerExecute = vi.fn();

vi.mock("../ResumeSelectionAgent", () => ({
  ResumeSelectionAgent: function MockResumeSelectionAgent() {
    this.id = "resume-selection-agent";
    this.name = "A5a";
    this.execute = mockSelectorExecute;
  },
}));

vi.mock("../VmockRunnerAgent", () => ({
  VmockRunnerAgent: function MockVmockRunnerAgent() {
    this.id = "vmock-runner-agent";
    this.name = "A5b";
    this.execute = mockRunnerExecute;
  },
}));

describe("ResumePipelineOrchestrator", () => {
  let orchestrator: ResumePipelineOrchestrator;

  beforeEach(() => {
    orchestrator = new ResumePipelineOrchestrator();
    vi.clearAllMocks();

    // Default: selection succeeds
    mockSelectorExecute.mockResolvedValue({
      success: true,
      data: { selectedResumePath: "/resumes/resume-fullstack.docx", matchScore: 0.82 },
      logs: [],
    });

    // Default: runner returns passing score
    mockRunnerExecute.mockResolvedValue({
      success: true,
      data: { score: 88, feedback: [], screenshotPath: "/screenshots/v1.png" },
      logs: [],
    });
  });

  it("emits resume.approved when VMock score passes threshold on first attempt", async () => {
    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    await orchestrator.runForJob({
      jobId: "acme-engineer-2026-06-01",
      jdText: "TypeScript engineer with Next.js",
    });

    const approvedCall = bus.emit.mock.calls.find(
      ([evt]: [{ type: string }]) => evt.type === "resume.approved"
    );
    expect(approvedCall).toBeDefined();
    expect(approvedCall[0].finalScore).toBe(88);
    expect(approvedCall[0].totalIterations).toBe(1);
  });

  it("emits resume.failed when max iterations exceeded", async () => {
    // Runner always returns score below threshold
    mockRunnerExecute.mockResolvedValue({
      success: true,
      data: { score: 55, feedback: ["Needs improvement"], screenshotPath: "/ss/v1.png" },
      logs: [],
    });

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    await orchestrator.runForJob({
      jobId: "acme-engineer-2026-06-01",
      jdText: "TypeScript engineer",
    });

    const failedCall = bus.emit.mock.calls.find(
      ([evt]: [{ type: string }]) => evt.type === "resume.failed"
    );
    expect(failedCall).toBeDefined();
    expect(failedCall[0].reason).toContain("Max iterations");
  });

  it("returns approved=true and correct score when pipeline succeeds", async () => {
    const result = await orchestrator.runForJob({
      jobId: "acme-engineer-2026-06-01",
      jdText: "TypeScript engineer with Next.js",
    });

    expect(result.approved).toBe(true);
    expect(result.finalScore).toBe(88);
    expect(result.totalIterations).toBe(1);
  });

  it("stops early and emits resume.failed when ResumeSelectionAgent fails", async () => {
    mockSelectorExecute.mockResolvedValue({
      success: false,
      data: undefined,
      logs: ["No resumes found"],
    });

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await orchestrator.runForJob({
      jobId: "acme-engineer-2026-06-01",
      jdText: "TypeScript engineer",
    });

    expect(result.approved).toBe(false);
    expect(result.totalIterations).toBe(0);

    const failedCall = bus.emit.mock.calls.find(
      ([evt]: [{ type: string }]) => evt.type === "resume.failed"
    );
    expect(failedCall).toBeDefined();
    expect(failedCall[0].reason).toContain("selection failed");

    // Runner should never have been called
    expect(mockRunnerExecute).not.toHaveBeenCalled();
  });
});
