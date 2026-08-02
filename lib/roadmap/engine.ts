import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";
import { DEFAULT_ROLE } from "@/lib/roles";
import { projectIdeaBank, projectIdeasForCategories } from "@/lib/projectIdeas";
import type { GapCategory } from "@/lib/projectIdeas";
import { resourcesForCategories } from "@/lib/resources";
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

  // One action per weak scenario, not per missed checkpoint — a scenario
  // with multiple missed checkpoints previously produced that many
  // identical-looking entries (same label, since label is the scenario
  // title), which showed up as literal duplicate roadmap items.
  return assessment.scenarios
    .filter((scenario) => weakCategories.includes(scenario.category))
    .map((scenario): RoadmapAction | null => {
      const missed = scenario.checkpoints.filter((checkpoint) => !checkpoint.correct);
      if (missed.length === 0) return null;
      const detail =
        missed.length === 1
          ? missed[0].explanation
          : `${missed.length} of ${scenario.checkpoints.length} checkpoints missed — start with: ${missed[0].explanation}`;
      return {
        id: scenario.id,
        label: scenario.title,
        detail,
        source: "assessment",
      };
    })
    .filter((action): action is RoadmapAction => action !== null);
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
  const { topActionsPerStage, topProjectsPerStage, topResourcesPerStage, stages } = roadmapConfig;
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

    const stageCategories = [...stage.cvCategories, ...stage.assessmentCategories] as GapCategory[];
    const projects = projectIdeasForCategories(projectIdeaBank, stageCategories, role, topProjectsPerStage);
    // Reuses the Resource Library's own role+category matching (lib/resources)
    // rather than a second, parallel resource system — same gap categories
    // that drive the project-idea suggestions above.
    const resources = resourcesForCategories(role, stageCategories).slice(0, topResourcesPerStage);

    steps.push({
      step: steps.length + 1,
      id: stage.id,
      title: stage.title,
      intro: stage.intro[role],
      actions,
      projects,
      resources,
    });
  }

  return steps;
}

/** Static, ordered "typical certification path" reference for a role — not gap-driven. */
export function certPathForRole(role: RoleKey = DEFAULT_ROLE): string[] {
  return roadmapConfig.certPaths[role];
}
