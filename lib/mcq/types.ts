import type { CategoryKey } from "@/lib/scoring";
import type { RoleKey } from "@/lib/roles";

export interface RawMcqChoice {
  id: string;
  label: string;
}

/** Category is restricted to the CV corpus's actionable categories — education is excluded, same as elsewhere. */
export type McqCategoryKey = Exclude<CategoryKey, "education">;

export interface RawMcqQuestion {
  id: string;
  category: McqCategoryKey;
  /** Which role tracks see this question — strict gating. See data/mcq-questions.json's role_gating_note. */
  roles: RoleKey[];
  question: string;
  choices: RawMcqChoice[];
  correctChoiceId: string;
  explanation: string;
}

export type McqBank = RawMcqQuestion[];

/** Public shape sent to the client — no correctChoiceId or explanation. */
export interface McqPrompt {
  id: string;
  category: McqCategoryKey;
  question: string;
  choices: RawMcqChoice[];
}

export interface McqAnswerSubmission {
  questionId: string;
  choiceId: string;
}

export interface McqQuestionResult {
  id: string;
  question: string;
  correct: boolean;
  submittedChoiceId: string | null;
  correctChoiceId: string;
  explanation: string;
}

export interface McqCategoryResult {
  label: string;
  score: number;
  total: number;
  correctCount: number;
}

export interface McqResult {
  overallScore: number;
  categories: Record<McqCategoryKey, McqCategoryResult>;
  questions: McqQuestionResult[];
}
