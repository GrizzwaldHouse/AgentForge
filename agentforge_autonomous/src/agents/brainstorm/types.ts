/**
 * BrainstormAgent type definitions.
 *
 * Models the structured brainstorm artifact produced during project scoping.
 * All types are plain data — no UI, no external dependencies.
 */

export interface BrainstormOption {
  id: string;
  label: string;
  rationale: string;
  locked: boolean;
}

export type QuestionType =
  | "single"
  | "multi"
  | "true_false"
  | "ranked"
  | "numeric_scale"
  | "abc_match";

export interface BrainstormQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: BrainstormOption[];
}

export interface BrainstormSection {
  id: string;
  title: string;
  questions: BrainstormQuestion[];
}

export interface BrainstormArtifact {
  title: string;
  theme: string;
  sections: BrainstormSection[];
  metadata: {
    capturedAt: string;
    projectSlug: string;
  };
}
