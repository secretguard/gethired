import mcqJson from "@/data/mcq-questions.json";
import type { McqBank, McqPrompt } from "./types";

export const mcqBank: McqBank = mcqJson.questions as McqBank;

/** Strips the correct answer and explanation before a question is sent to the client. */
export function toMcqPrompts(bank: McqBank): McqPrompt[] {
  return bank.map((question) => ({
    id: question.id,
    category: question.category,
    question: question.question,
    choices: question.choices,
  }));
}
