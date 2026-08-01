import type { RoleKey } from "@/lib/roles";

export type AssessmentCategoryKey =
  | "log_analysis"
  | "networking"
  | "vulnerability_identification"
  | "owasp_top10"
  | "incident_response";

export interface RawCheckpoint {
  id: string;
  question: string;
  /** Normalized (lowercase, trimmed, whitespace-collapsed) accepted answers/synonyms. */
  acceptedAnswers: string[];
  points: number;
  explanation: string;
}

/**
 * One scenario pairs a single static artifact (a log excerpt, code snippet,
 * ticket description, etc.) with 2-4 sequential checkpoint questions that
 * mirror how an analyst would investigate it. Never sent to the client as-is
 * — `checkpoints[].acceptedAnswers` is the answer key.
 */
export interface RawScenario {
  id: string;
  category: AssessmentCategoryKey;
  /** Which role tracks see this scenario — strict gating, not weighting. See data/assessment-scenarios.json's role_gating_note. */
  roles: RoleKey[];
  title: string;
  scenario: string;
  artifactLabel: string;
  artifact: string;
  checkpoints: RawCheckpoint[];
}

export type ScenarioBank = RawScenario[];

export interface CheckpointPrompt {
  id: string;
  question: string;
  points: number;
}

/** Public shape sent to the client — no accepted answers or explanations. */
export interface ScenarioPrompt {
  id: string;
  category: AssessmentCategoryKey;
  title: string;
  scenario: string;
  artifactLabel: string;
  artifact: string;
  checkpoints: CheckpointPrompt[];
}

export interface AnswerSubmission {
  checkpointId: string;
  answer: string;
}

export interface CheckpointResult {
  id: string;
  question: string;
  correct: boolean;
  points: number;
  pointsAwarded: number;
  submittedAnswer: string;
  explanation: string;
}

export interface ScenarioResult {
  id: string;
  title: string;
  category: AssessmentCategoryKey;
  checkpoints: CheckpointResult[];
}

export interface AssessmentCategoryResult {
  label: string;
  score: number;
  totalPoints: number;
  earnedPoints: number;
}

/** Readiness score computed only from the categories central to the selected role track — reported alongside, not instead of, the overall score. */
export interface RoleReadiness {
  role: RoleKey;
  label: string;
  score: number;
  categories: AssessmentCategoryKey[];
}

export interface AssessmentResult {
  overallScore: number;
  categories: Record<AssessmentCategoryKey, AssessmentCategoryResult>;
  scenarios: ScenarioResult[];
  roleReadiness: RoleReadiness;
}
