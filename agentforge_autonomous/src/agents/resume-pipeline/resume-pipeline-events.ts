export interface ResumeSelectedEvent {
  type: "resume.selected";
  jobId: string;
  resumePath: string;
  matchScore: number;
  selectedAt: string;
}

export interface VmockUploadCompleteEvent {
  type: "vmock.upload_complete";
  jobId: string;
  resumePath: string;
  iterationNumber: number;
  uploadedAt: string;
}

export interface VmockScoredEvent {
  type: "vmock.scored";
  jobId: string;
  score: number;
  feedback: string[];
  screenshotPath: string;
  iterationNumber: number;
  scoredAt: string;
}

export interface ResumeIterationNeededEvent {
  type: "resume.iteration_needed";
  jobId: string;
  resumePath: string;
  feedback: string[];
  iterationNumber: number;
  requestedAt: string;
}

export interface ResumeApprovedEvent {
  type: "resume.approved";
  jobId: string;
  finalResumePath: string;
  finalScore: number;
  totalIterations: number;
  approvedAt: string;
}

export interface ResumeFailedEvent {
  type: "resume.failed";
  jobId: string;
  reason: string;
  lastScore: number;
  failedAt: string;
}

export type ResumePipelineEvent =
  | ResumeSelectedEvent
  | VmockUploadCompleteEvent
  | VmockScoredEvent
  | ResumeIterationNeededEvent
  | ResumeApprovedEvent
  | ResumeFailedEvent;

export const RESUME_EVENT_TYPES = new Set([
  "resume.selected",
  "vmock.upload_complete",
  "vmock.scored",
  "resume.iteration_needed",
  "resume.approved",
  "resume.failed",
] as const);
