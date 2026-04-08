import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import type { JobApplication, FollowUp, ApplicationStatus, WeeklyStats } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "job-applications.json");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store
let applications: JobApplication[] = [];
let isWriting = false;
let pendingWrite: (() => void) | null = null;

// Load from file on startup
function loadApplications(): void {
  try {
    if (existsSync(DATA_FILE)) {
      const data = readFileSync(DATA_FILE, "utf-8");
      applications = JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load applications:", error);
    applications = [];
  }
}

// Save to file with simple write queue to prevent concurrent writes
function saveApplications(): void {
  const doWrite = () => {
    try {
      isWriting = true;
      writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save applications:", error);
    } finally {
      isWriting = false;
      if (pendingWrite) {
        const nextWrite = pendingWrite;
        pendingWrite = null;
        nextWrite();
      }
    }
  };

  if (isWriting) {
    // Queue the write
    pendingWrite = doWrite;
  } else {
    doWrite();
  }
}

// Initialize on module load
loadApplications();

// CRUD operations
export function addApplication(app: Omit<JobApplication, "id" | "savedAt" | "followUps" | "keywords">): JobApplication {
  const newApp: JobApplication = {
    ...app,
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    followUps: [],
    keywords: [],
  };
  applications.push(newApp);
  saveApplications();
  return newApp;
}

export function updateApplication(id: string, updates: Partial<JobApplication>): JobApplication | null {
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) return null;

  applications[index] = { ...applications[index], ...updates };
  saveApplications();
  return applications[index];
}

export function deleteApplication(id: string): boolean {
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) return false;

  applications.splice(index, 1);
  saveApplications();
  return true;
}

export function getAll(): JobApplication[] {
  return [...applications];
}

export function getByStatus(status: ApplicationStatus): JobApplication[] {
  return applications.filter((a) => a.status === status);
}

export function getById(id: string): JobApplication | null {
  return applications.find((a) => a.id === id) ?? null;
}

// Follow-up operations
export function addFollowUp(appId: string, followUp: Omit<FollowUp, "id">): FollowUp | null {
  const app = getById(appId);
  if (!app) return null;

  const newFollowUp: FollowUp = {
    ...followUp,
    id: randomUUID(),
  };

  app.followUps.push(newFollowUp);
  saveApplications();
  return newFollowUp;
}

export function markFollowUpComplete(appId: string, followUpId: string): boolean {
  const app = getById(appId);
  if (!app) return false;

  const followUp = app.followUps.find((f) => f.id === followUpId);
  if (!followUp) return false;

  followUp.completed = true;
  saveApplications();
  return true;
}

export function getDueFollowUps(): Array<{ app: JobApplication; followUp: FollowUp }> {
  const now = new Date();
  const results: Array<{ app: JobApplication; followUp: FollowUp }> = [];

  for (const app of applications) {
    for (const followUp of app.followUps) {
      if (!followUp.completed && new Date(followUp.date) <= now) {
        results.push({ app, followUp });
      }
    }
  }

  return results;
}

// Stats operations
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday as start of week
  return new Date(d.setDate(diff));
}

export function getWeeklyStats(weekStart?: Date): WeeklyStats {
  const start = weekStart ? getWeekStart(weekStart) : getWeekStart(new Date());
  const weekEnd = new Date(start);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyApps = applications.filter((app) => {
    const appliedDate = app.appliedAt ? new Date(app.appliedAt) : null;
    return appliedDate && appliedDate >= start && appliedDate < weekEnd;
  });

  const byStatus: Record<ApplicationStatus, number> = {
    saved: 0,
    applied: 0,
    interview: 0,
    rejected: 0,
    offer: 0,
    accepted: 0,
  };

  for (const app of weeklyApps) {
    byStatus[app.status]++;
  }

  const goalTarget = 7;
  const total = weeklyApps.length;

  return {
    weekStart: start.toISOString(),
    total,
    byStatus,
    goalTarget,
    goalMet: total >= goalTarget,
  };
}

export function getWeeklyGoalProgress(): { current: number; target: number; goalMet: boolean } {
  const stats = getWeeklyStats();
  return {
    current: stats.total,
    target: stats.goalTarget,
    goalMet: stats.goalMet,
  };
}
