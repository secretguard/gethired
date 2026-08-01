import { CATEGORY_LABELS, OVERALL_SCORE_CATEGORIES } from "@/lib/scoring";
import type { McqAnswerSubmission, McqBank, McqCategoryKey, McqCategoryResult, McqQuestionResult, McqResult } from "./types";

const MCQ_CATEGORY_ORDER = OVERALL_SCORE_CATEGORIES as McqCategoryKey[];

export function scoreMcq(submissions: McqAnswerSubmission[], bank: McqBank): McqResult {
  const choiceByQuestionId = new Map(submissions.map((submission) => [submission.questionId, submission.choiceId]));

  const questions: McqQuestionResult[] = bank.map((question) => {
    const submittedChoiceId = choiceByQuestionId.get(question.id) ?? null;
    return {
      id: question.id,
      question: question.question,
      correct: submittedChoiceId === question.correctChoiceId,
      submittedChoiceId,
      correctChoiceId: question.correctChoiceId,
      explanation: question.explanation,
    };
  });

  const categories = {} as Record<McqCategoryKey, McqCategoryResult>;
  for (const category of MCQ_CATEGORY_ORDER) {
    const categoryQuestionIds = new Set(bank.filter((q) => q.category === category).map((q) => q.id));
    const categoryResults = questions.filter((q) => categoryQuestionIds.has(q.id));
    const total = categoryResults.length;
    const correctCount = categoryResults.filter((q) => q.correct).length;

    categories[category] = {
      label: CATEGORY_LABELS[category],
      score: total === 0 ? 0 : Math.round((correctCount / total) * 100),
      total,
      correctCount,
    };
  }

  const totalQuestions = questions.length;
  const totalCorrect = questions.filter((q) => q.correct).length;
  const overallScore = totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);

  return { overallScore, categories, questions };
}
