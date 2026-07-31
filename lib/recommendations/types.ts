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
  // Partial: "education" deliberately has no entry here — it's excluded from
  // recommendations entirely (see lib/recommendations/engine.ts).
  categoryThresholds: Partial<Record<CategoryKey, number>>;
  categoryMessages: Partial<Record<CategoryKey, CategoryGapMessage>>;
}
