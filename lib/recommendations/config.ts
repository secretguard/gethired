import configJson from "@/data/recommendations-config.json";
import type { RecommendationsConfig } from "./types";

export const recommendationsConfig = configJson as RecommendationsConfig;

export function getCategoryGapIntro(category: keyof RecommendationsConfig["categoryMessages"]): string {
  return recommendationsConfig.categoryMessages[category].gapIntro;
}
