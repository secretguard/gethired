import type { CategoryKey } from "@/lib/scoring";
import type { AssessmentCategoryKey } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";
import type { ProjectIdea } from "@/lib/projectIdeas";

export interface RoadmapStageConfig {
  id: string;
  title: string;
  /** Per-role phrasing — what this stage means day-to-day differs by track (V4-P4). */
  intro: Record<RoleKey, string>;
  /** Gating for these is handled entirely by the recommendation engine's own thresholds (data/recommendations-config.json) — a stage only needs CV categories listed for grouping, not a separate threshold. */
  cvCategories: CategoryKey[];
  assessmentCategories: AssessmentCategoryKey[];
  assessmentThreshold: number;
}

export interface RoadmapConfig {
  topActionsPerStage: number;
  /** Project ideas surfaced per stage (V4-P5) — capped separately from actions since they're a different kind of suggestion. */
  topProjectsPerStage: number;
  /** Static, ordered "typical certification path" reference per role — not gap-driven, shown alongside the adaptive stages. */
  certPaths: Record<RoleKey, string[]>;
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
  /** Project ideas tied to this stage's gap categories (V4-P5) — empty when no idea covers them (e.g. certifications/soft-skills stages). */
  projects: ProjectIdea[];
}
