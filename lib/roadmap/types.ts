import type { CategoryKey } from "@/lib/scoring";
import type { AssessmentCategoryKey } from "@/lib/assessment";

export interface RoadmapStageConfig {
  id: string;
  title: string;
  intro: string;
  /** Gating for these is handled entirely by the recommendation engine's own thresholds (data/recommendations-config.json) — a stage only needs CV categories listed for grouping, not a separate threshold. */
  cvCategories: CategoryKey[];
  assessmentCategories: AssessmentCategoryKey[];
  assessmentThreshold: number;
}

export interface RoadmapConfig {
  topActionsPerStage: number;
  stages: RoadmapStageConfig[];
}

export interface RoadmapAction {
  id: string;
  label: string;
  detail: string;
  source: "cv" | "assessment";
}

export interface RoadmapStep {
  step: number;
  id: string;
  title: string;
  intro: string;
  actions: RoadmapAction[];
}
