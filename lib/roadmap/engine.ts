import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";
import { roadmapConfig } from "./config";
import type { RoadmapAction, RoadmapStep } from "./types";

function cvActionsForStage(recommendations: Recommendation[], cvCategories: string[]): RoadmapAction[] {
  return recommendations
    .filter((rec) => cvCategories.includes(rec.category))
    .map((rec) => ({ id: rec.id, label: rec.title, detail: rec.detail, source: "cv" as const }));
}

function assessmentActionsForStage(
  assessment: AssessmentResult | null,
  assessmentCategories: string[],
  assessmentThreshold: number
): RoadmapAction[] {
  if (!assessment || assessmentCategories.length === 0) return [];

  const weakCategories = assessmentCategories.filter(
    (category) => assessment.categories[category as keyof typeof assessment.categories]?.score < assessmentThreshold
  );
  if (weakCategories.length === 0) return [];

  return assessment.scenarios
    .filter((scenario) => weakCategories.includes(scenario.category))
    .flatMap((scenario) =>
      scenario.checkpoints
        .filter((checkpoint) => !checkpoint.correct)
        .map((checkpoint) => ({
          id: checkpoint.id,
          label: scenario.title,
          detail: checkpoint.explanation,
          source: "assessment" as const,
        }))
    );
}

/**
 * Combines CV-gap recommendations (Phase 5) with practical-assessment gaps
 * (Phase 4) into a sequenced, multi-step roadmap. Reuses the recommendation
 * engine's output directly rather than re-deriving CV gap copy, and reuses
 * its config-driven shape (data/roadmap-config.json) for the stage
 * definitions. A stage only appears if it actually has a gap — this isn't a
 * fixed checklist, it adapts to what the person still needs.
 */
export function generateRoadmap(
  recommendations: Recommendation[],
  assessment: AssessmentResult | null
): RoadmapStep[] {
  const { topActionsPerStage, stages } = roadmapConfig;
  const steps: RoadmapStep[] = [];

  for (const stage of stages) {
    const cvActions = cvActionsForStage(recommendations, stage.cvCategories);
    const assessmentActions = assessmentActionsForStage(
      assessment,
      stage.assessmentCategories,
      stage.assessmentThreshold
    );

    const actions = [...cvActions, ...assessmentActions].slice(0, topActionsPerStage);
    if (actions.length === 0) continue;

    steps.push({
      step: steps.length + 1,
      id: stage.id,
      title: stage.title,
      intro: stage.intro,
      actions,
    });
  }

  return steps;
}
