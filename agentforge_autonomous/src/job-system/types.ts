export type ApplicationStatus = "saved" | "applied" | "interview" | "rejected" | "offer" | "accepted";
export type ResumeVariant = "game-dev" | "full-stack" | "ai-ml" | "tools";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  url: string;
  status: ApplicationStatus;
  appliedAt: string | null; // ISO date
  savedAt: string; // ISO date
  source: string; // "indeed" | "linkedin" | "hitmarker" | "manual" etc.
  resumeVariant: ResumeVariant;
  notes: string;
  followUps: FollowUp[];
  keywords: string[];
}

export interface FollowUp {
  id: string;
  date: string; // ISO date
  type: "email" | "linkedin" | "phone" | "other";
  completed: boolean;
  notes: string;
}

export interface WeeklyStats {
  weekStart: string;
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  goalTarget: number;
  goalMet: boolean;
}
