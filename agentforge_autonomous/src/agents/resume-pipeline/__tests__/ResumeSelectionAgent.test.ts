import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResumeSelectionAgent } from "../ResumeSelectionAgent";
import * as agentEventBusModule from "@/core/events/agent-event-bus";

vi.mock("fs/promises", () => ({
  readdir: vi.fn().mockResolvedValue(["resume-fullstack.docx", "resume-gamedev.docx"]),
  readFile: vi.fn().mockResolvedValue(Buffer.from("resume text content")),
}));

vi.mock("@/core/events/agent-event-bus", () => ({
  agentEventBus: { emit: vi.fn() },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock config to avoid needing settings.json on disk during tests
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

describe("ResumeSelectionAgent", () => {
  let agent: ResumeSelectionAgent;

  beforeEach(() => {
    agent = new ResumeSelectionAgent();
    vi.clearAllMocks();
  });

  it("emits resume.selected with highest scoring resume", async () => {
    // HF returns embeddings: [jdEmbedding, resume0Embedding, resume1Embedding]
    // resume0 gets score 0.82, resume1 gets score 0.61
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        [1, 0, 0],   // jd embedding
        [0.82, 0.1, 0], // resume-fullstack (high similarity to jd)
        [0.3, 0.9, 0],  // resume-gamedev (low similarity)
      ],
    });

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await agent.execute({
      taskId: "select-acme-001",
      context: {
        jobId: "acme-engineer-2026-06-01",
        jdText: "We need a TypeScript engineer with Next.js experience.",
      },
    });

    expect(result.success).toBe(true);
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "resume.selected" })
    );
    const emittedEvt = bus.emit.mock.calls[0][0] as { matchScore: number };
    expect(emittedEvt.matchScore).toBeGreaterThan(0.6);
  });

  it("emits resume.failed when no resumes found in vault", async () => {
    const { readdir } = await import("fs/promises");
    vi.mocked(readdir).mockResolvedValueOnce([]);

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await agent.execute({
      taskId: "select-acme-002",
      context: { jobId: "acme-engineer-2026-06-01", jdText: "TypeScript engineer" },
    });

    expect(result.success).toBe(false);
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "resume.failed", reason: expect.stringContaining("No resume") })
    );
  });

  it("emits resume.failed when match score below threshold", async () => {
    // Both resumes score below 0.65 threshold
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        [1, 0, 0],
        [0.3, 0.9, 0.1],
        [0.2, 0.8, 0.2],
      ],
    });

    const bus = agentEventBusModule.agentEventBus as unknown as { emit: ReturnType<typeof vi.fn> };

    const result = await agent.execute({
      taskId: "select-acme-003",
      context: { jobId: "acme-engineer-2026-06-01", jdText: "TypeScript engineer" },
    });

    expect(result.success).toBe(false);
    expect(bus.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "resume.failed", reason: expect.stringContaining("below threshold") })
    );
  });

  it("returns selectedResumePath in output data on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        [1, 0, 0],
        [0.9, 0.1, 0],
        [0.3, 0.7, 0],
      ],
    });

    const result = await agent.execute({
      taskId: "select-acme-004",
      context: { jobId: "acme-engineer-2026-06-01", jdText: "TypeScript engineer" },
    });

    expect(result.success).toBe(true);
    expect((result.data as Record<string, unknown>).selectedResumePath).toBeTruthy();
  });
});
