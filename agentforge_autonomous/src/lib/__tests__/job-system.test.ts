import { describe, it, expect, beforeEach } from "vitest";
import { addApplication, getAll, getById, updateApplication, deleteApplication, getWeeklyStats } from "@/job-system/store";
import type { ResumeVariant } from "@/job-system/types";

describe("Job System Store", () => {
  beforeEach(() => {
    // Clear all applications before each test
    const apps = getAll();
    apps.forEach(app => deleteApplication(app.id));
  });

  it("should add a new application", () => {
    const newApp = addApplication({
      company: "Test Company",
      role: "Software Engineer",
      url: "https://example.com/job",
      status: "saved",
      appliedAt: null,
      source: "linkedin",
      resumeVariant: "full-stack" as ResumeVariant,
      notes: "Test notes",
    });

    expect(newApp.id).toBeDefined();
    expect(newApp.company).toBe("Test Company");
    expect(newApp.role).toBe("Software Engineer");
    expect(newApp.status).toBe("saved");
    expect(newApp.savedAt).toBeDefined();
  });

  it("should retrieve all applications", () => {
    addApplication({
      company: "Company 1",
      role: "Role 1",
      url: "https://example.com/1",
      status: "saved",
      appliedAt: null,
      source: "indeed",
      resumeVariant: "game-dev" as ResumeVariant,
      notes: "",
    });

    addApplication({
      company: "Company 2",
      role: "Role 2",
      url: "https://example.com/2",
      status: "applied",
      appliedAt: new Date().toISOString(),
      source: "linkedin",
      resumeVariant: "ai-ml" as ResumeVariant,
      notes: "",
    });

    const apps = getAll();
    expect(apps).toHaveLength(2);
  });

  it("should retrieve application by id", () => {
    const newApp = addApplication({
      company: "Test Company",
      role: "Test Role",
      url: "https://example.com/test",
      status: "saved",
      appliedAt: null,
      source: "manual",
      resumeVariant: "tools" as ResumeVariant,
      notes: "",
    });

    const retrieved = getById(newApp.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.company).toBe("Test Company");
  });

  it("should update application status", () => {
    const newApp = addApplication({
      company: "Test Company",
      role: "Test Role",
      url: "https://example.com/test",
      status: "saved",
      appliedAt: null,
      source: "manual",
      resumeVariant: "full-stack" as ResumeVariant,
      notes: "",
    });

    const updated = updateApplication(newApp.id, {
      status: "applied",
      appliedAt: new Date().toISOString(),
    });

    expect(updated).toBeDefined();
    expect(updated?.status).toBe("applied");
    expect(updated?.appliedAt).toBeDefined();
  });

  it("should delete application", () => {
    const newApp = addApplication({
      company: "Test Company",
      role: "Test Role",
      url: "https://example.com/test",
      status: "saved",
      appliedAt: null,
      source: "manual",
      resumeVariant: "game-dev" as ResumeVariant,
      notes: "",
    });

    const success = deleteApplication(newApp.id);
    expect(success).toBe(true);

    const retrieved = getById(newApp.id);
    expect(retrieved).toBeNull();
  });

  it("should calculate weekly stats", () => {
    const now = new Date();
    addApplication({
      company: "Company 1",
      role: "Role 1",
      url: "https://example.com/1",
      status: "applied",
      appliedAt: now.toISOString(),
      source: "linkedin",
      resumeVariant: "full-stack" as ResumeVariant,
      notes: "",
    });

    addApplication({
      company: "Company 2",
      role: "Role 2",
      url: "https://example.com/2",
      status: "interview",
      appliedAt: now.toISOString(),
      source: "indeed",
      resumeVariant: "game-dev" as ResumeVariant,
      notes: "",
    });

    const stats = getWeeklyStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.goalTarget).toBe(7);
    expect(stats.weekStart).toBeDefined();
  });
});
