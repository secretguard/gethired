import interviewPrepJson from "@/data/interview-prep.json";
import type { RoleKey } from "@/lib/roles";
import type { InterviewPrepBank, RoleInterviewContent } from "./types";

export const interviewPrepBank: InterviewPrepBank = interviewPrepJson as InterviewPrepBank;

/** Strict role gating, same shape as the Assessment/MCQ/Roadmap: only this track's content. */
export function interviewPrepForRole(role: RoleKey): RoleInterviewContent {
  const content = interviewPrepBank.roles.find((entry) => entry.role === role);
  if (!content) {
    throw new Error(`No interview prep content for role: ${role}`);
  }
  return content;
}
