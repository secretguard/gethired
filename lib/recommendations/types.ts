import type { CategoryKey } from "@/lib/scoring";

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
