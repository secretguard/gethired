import configJson from "@/data/recommendations-config.json";
import type { RecommendationsConfig } from "./types";

export const recommendationsConfig = configJson as RecommendationsConfig;

/**
 * How many recommendations the CV Screener's "Concrete suggestions" section
 * (and the equivalent email section) displays. `generateRecommendations()`
 * itself stays uncapped — lib/roadmap consumes its full output directly, so
 * this cap is display-layer only and must not be applied inside the engine.
 */
export const DISPLAY_RECOMMENDATION_LIMIT = 5;

export function getCategoryGapIntro(category: keyof RecommendationsConfig["categoryMessages"]): string | undefined {
  return recommendationsConfig.categoryMessages[category]?.gapIntro;
}
