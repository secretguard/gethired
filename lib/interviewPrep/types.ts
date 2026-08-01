import type { RoleKey } from "@/lib/roles";

export interface InterviewQuestion {
  id: string;
  question: string;
  /** What the interviewer is actually checking for — not a scripted answer, just orientation. */
  whatTheyreChecking: string;
}

export interface RoleInterviewContent {
  role: RoleKey;
  /** Real-world sourced note on interview format/logistics for this track (e.g. practical exercises). */
  formatNote: string;
  technicalQuestions: InterviewQuestion[];
}

export interface InterviewPrepBank {
  roles: RoleInterviewContent[];
  /** Shared across every track — behavioral/soft-skill questions. */
  behavioralQuestions: InterviewQuestion[];
  /** A short, sourced note on a standard behavioral-answer framework (e.g. STAR). */
  behavioralFramework: {
    name: string;
    description: string;
  };
}
