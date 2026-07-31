import type { CategoryKey } from "@/lib/scoring";

/**
 * Placeholder shape for a future practical-assessment result (Phase 4 is
 * deferred and will be scoped separately). Not used by generateRecommendations
 * yet — kept here only so the function signature doesn't need to change again
 * once that system exists.
 */
export interface LabScore {
  category: string;
  score: number;
}

export interface Recommendation {
  id: string;
  category: CategoryKey;
  categoryLabel: string;
  title: string;
  detail: string;
  weight: number;
}

export interface CategoryGapMessage {
  gapIntro: string;
  itemTemplate: string;
}

export interface RecommendationsConfig {
  topNPerCategory: number;
  categoryThresholds: Record<CategoryKey, number>;
  categoryMessages: Record<CategoryKey, CategoryGapMessage>;
}
