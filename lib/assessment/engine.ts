import type { RoleKey } from "@/lib/roles";
import { DEFAULT_ROLE, ROLE_SHORT_LABELS } from "@/lib/roles";
import { answerMatches } from "./matcher";
import { ASSESSMENT_CATEGORY_LABELS, ASSESSMENT_CATEGORY_ORDER } from "./categories";
import { ASSESSMENT_ROLE_CORE_CATEGORIES } from "./roleConfig";
import type {
  AnswerSubmission,
  AssessmentCategoryResult,
  AssessmentResult,
  AssessmentCategoryKey,
  CheckpointResult,
  RoleReadiness,
  ScenarioBank,
  ScenarioResult,
} from "./types";

export function scoreAssessment(
  submissions: AnswerSubmission[],
  bank: ScenarioBank,
  role: RoleKey = DEFAULT_ROLE
): AssessmentResult {
  const answersById = new Map(submissions.map((submission) => [submission.checkpointId, submission.answer]));

  const scenarios: ScenarioResult[] = bank.map((scenario) => {
    const checkpoints: CheckpointResult[] = scenario.checkpoints.map((checkpoint) => {
      const submittedAnswer = answersById.get(checkpoint.id) ?? "";
      const correct = answerMatches(submittedAnswer, checkpoint.acceptedAnswers);
      return {
        id: checkpoint.id,
        question: checkpoint.question,
        correct,
        points: checkpoint.points,
        pointsAwarded: correct ? checkpoint.points : 0,
        submittedAnswer,
        explanation: checkpoint.explanation,
      };
    });

    return {
      id: scenario.id,
      title: scenario.title,
      category: scenario.category,
      checkpoints,
    };
  });

  const categories = {} as Record<AssessmentCategoryKey, AssessmentCategoryResult>;
  for (const category of ASSESSMENT_CATEGORY_ORDER) {
    const categoryScenarios = scenarios.filter((scenario) => scenario.category === category);
    const allCheckpoints = categoryScenarios.flatMap((scenario) => scenario.checkpoints);
    const totalPoints = allCheckpoints.reduce((sum, checkpoint) => sum + checkpoint.points, 0);
    const earnedPoints = allCheckpoints.reduce((sum, checkpoint) => sum + checkpoint.pointsAwarded, 0);

    categories[category] = {
      label: ASSESSMENT_CATEGORY_LABELS[category],
      score: totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100),
      totalPoints,
      earnedPoints,
    };
  }

  const overallTotalPoints = Object.values(categories).reduce((sum, category) => sum + category.totalPoints, 0);
  const overallEarnedPoints = Object.values(categories).reduce((sum, category) => sum + category.earnedPoints, 0);
  const overallScore = overallTotalPoints === 0 ? 0 : Math.round((overallEarnedPoints / overallTotalPoints) * 100);

  const roleReadiness = computeRoleReadiness(categories, role);

  return { overallScore, categories, scenarios, roleReadiness };
}

function computeRoleReadiness(
  categories: Record<AssessmentCategoryKey, AssessmentCategoryResult>,
  role: RoleKey
): RoleReadiness {
  const coreCategories = ASSESSMENT_ROLE_CORE_CATEGORIES[role];
  const totalPoints = coreCategories.reduce((sum, category) => sum + categories[category].totalPoints, 0);
  const earnedPoints = coreCategories.reduce((sum, category) => sum + categories[category].earnedPoints, 0);
  const score = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);

  return { role, label: ROLE_SHORT_LABELS[role], score, categories: coreCategories };
}
