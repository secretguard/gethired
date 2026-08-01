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

export interface AssessmentResult {
  overallScore: number;
  categories: Record<AssessmentCategoryKey, AssessmentCategoryResult>;
  scenarios: ScenarioResult[];
}
