import { describe, it, expect } from "vitest";
import type {
  ResumeSelectedEvent,
  VmockScoredEvent,
  ResumeApprovedEvent,
  ResumeFailedEvent,
} from "../resume-pipeline-events";
import { RESUME_EVENT_TYPES } from "../resume-pipeline-events";

describe("resume-pipeline-events", () => {
  it("RESUME_EVENT_TYPES contains all 6 event type strings", () => {
    expect(RESUME_EVENT_TYPES.size).toBe(6);
    expect(RESUME_EVENT_TYPES.has("resume.selected")).toBe(true);
    expect(RESUME_EVENT_TYPES.has("vmock.upload_complete")).toBe(true);
    expect(RESUME_EVENT_TYPES.has("vmock.scored")).toBe(true);
    expect(RESUME_EVENT_TYPES.has("resume.iteration_needed")).toBe(true);
    expect(RESUME_EVENT_TYPES.has("resume.approved")).toBe(true);
    expect(RESUME_EVENT_TYPES.has("resume.failed")).toBe(true);
  });

  it("ResumeSelectedEvent shape has required fields", () => {
    const evt: ResumeSelectedEvent = {
      type: "resume.selected",
      jobId: "acme-engineer-2026-06-01",
      resumePath: "/resumes/fullstack-v2.docx",
      matchScore: 0.82,
      selectedAt: new Date().toISOString(),
    };
    expect(evt.type).toBe("resume.selected");
    expect(typeof evt.matchScore).toBe("number");
  });

  it("VmockScoredEvent shape has feedback array", () => {
    const evt: VmockScoredEvent = {
      type: "vmock.scored",
      jobId: "acme-engineer-2026-06-01",
      score: 72,
      feedback: ["Add quantified metrics", "Strengthen action verbs"],
      screenshotPath: "/screenshots/vmock-v1.png",
      iterationNumber: 1,
      scoredAt: new Date().toISOString(),
    };
    expect(Array.isArray(evt.feedback)).toBe(true);
    expect(evt.score).toBe(72);
  });

  it("ResumeApprovedEvent shape has totalIterations", () => {
    const evt: ResumeApprovedEvent = {
      type: "resume.approved",
      jobId: "acme-engineer-2026-06-01",
      finalResumePath: "/jobs/acme-engineer-2026-06-01/resume-final.docx",
      finalScore: 88,
      totalIterations: 2,
      approvedAt: new Date().toISOString(),
    };
    expect(evt.totalIterations).toBe(2);
  });

  it("ResumeFailedEvent shape has lastScore and reason", () => {
    const evt: ResumeFailedEvent = {
      type: "resume.failed",
      jobId: "acme-engineer-2026-06-01",
      reason: "Max iterations exceeded",
      lastScore: 61,
      failedAt: new Date().toISOString(),
    };
    expect(evt.lastScore).toBe(61);
  });
});
