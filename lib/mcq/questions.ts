import mcqJson from "@/data/mcq-questions.json";
import type { RoleKey } from "@/lib/roles";
import type { McqBank, McqPrompt } from "./types";

export const mcqBank: McqBank = mcqJson.questions as McqBank;

/** Strict role gating: only the questions tagged for this role track. */
export function questionsForRole(bank: McqBank, role: RoleKey): McqBank {
  return bank.filter((question) => question.roles.includes(role));
}

/** Strips the correct answer and explanation before a question is sent to the client. */
export function toMcqPrompts(bank: McqBank): McqPrompt[] {
  return bank.map((question) => ({
    id: question.id,
    category: question.category,
    question: question.question,
    choices: question.choices,
  }));
}
