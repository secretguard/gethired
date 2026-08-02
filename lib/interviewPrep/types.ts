import type { RoleKey } from "@/lib/roles";

/**
 * Points to the specific Assessment category or Quiz category that
 * objectively tests the same underlying skill this interview question is
 * about — Interview Prep is the content-review layer, the Assessment/Quiz
 * are the objective readiness signal. `category` is an AssessmentCategoryKey
 * when tool is "assessment", or an McqCategoryKey when tool is "quiz" —
 * plain string here (rather than importing those types) to avoid a
 * lib/assessment <-> lib/mcq <-> lib/interviewPrep import cycle; the actual
 * values used in data/interview-prep.json are always valid category keys.
 */
export interface TestedIn {
  tool: "assessment" | "quiz";
  category: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  /** What the interviewer is actually checking for — not a scripted answer, just orientation. */
  whatTheyreChecking: string;
  /** Key points/structure a strong answer should hit — not a scripted answer, just what a strong one covers. */
  strongAnswerCovers?: string[];
  /** Cross-link to where this can be objectively tested, not just read about. */
  testedIn?: TestedIn;
}

export interface RoleInterviewContent {
  role: RoleKey;
  /** Real-world sourced note on interview format/logistics for this track (e.g. practical exercises). */
  formatNote: string;
  technicalQuestions: InterviewQuestion[];
}

export interface StarWorkedExample {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewPrepBank {
  roles: RoleInterviewContent[];
  /** Shared across every track — behavioral/soft-skill questions. */
  behavioralQuestions: InterviewQuestion[];
  /** A short, sourced note on a standard behavioral-answer framework (e.g. STAR). */
  behavioralFramework: {
    name: string;
    description: string;
    /** A concrete worked mini-example showing what each STAR part actually looks like, not just the acronym expansion. */
    workedExample: StarWorkedExample;
  };
}
