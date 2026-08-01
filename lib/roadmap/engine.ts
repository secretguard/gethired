import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";
import { DEFAULT_ROLE } from "@/lib/roles";
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

  const weakCategories = assessmentCategories.filter((category) => {
    const categoryResult = assessment.categories[category as keyof typeof assessment.categories];
    // totalPoints === 0 means this category wasn't part of the person's role-gated
    // assessment at all (V4-P2) — that's "not measured," not "weak."
    return categoryResult && categoryResult.totalPoints > 0 && categoryResult.score < assessmentThreshold;
  });
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
 * fixed checklist, it adapts to what the person still needs. `role` (V4-P4)
 * only resolves which per-role intro copy each stage shows — which stages
 * appear is already role-specific transitively, since `recommendations` and
 * `assessment` are themselves role-gated upstream (V4-P0/V4-P2).
 */
export function generateRoadmap(
  recommendations: Recommendation[],
  assessment: AssessmentResult | null,
  role: RoleKey = DEFAULT_ROLE
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
      intro: stage.intro[role],
      actions,
    });
  }

  return steps;
}

/** Static, ordered "typical certification path" reference for a role — not gap-driven. */
export function certPathForRole(role: RoleKey = DEFAULT_ROLE): string[] {
  return roadmapConfig.certPaths[role];
}
