import type { CategoryKey, CategoryResult } from "@/lib/scoring";
import { recommendationsConfig } from "./config";
import type { LabScore, Recommendation } from "./types";

const CATEGORY_ORDER: CategoryKey[] = ["certifications", "tools", "concepts", "soft_skills"];

/**
 * Rule-based next-step recommendations from CV gaps. `labScores` is accepted
 * for forward compatibility with the future practical assessment (Phase 4,
 * deferred) but is not used yet — every current call site omits it.
 */
export function generateRecommendations(
  cvGaps: Record<CategoryKey, CategoryResult>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for the future practical assessment (Phase 4, deferred)
  labScores?: LabScore[]
): Recommendation[] {
  const { categoryThresholds, topNPerCategory, categoryMessages } = recommendationsConfig;
  const recommendations: Recommendation[] = [];

  for (const category of CATEGORY_ORDER) {
    const result = cvGaps[category];
    if (!result || result.score >= categoryThresholds[category]) continue;

    const { itemTemplate } = categoryMessages[category];
    const topMissing = [...result.missing].sort((a, b) => b.weight - a.weight).slice(0, topNPerCategory);

    for (const item of topMissing) {
      recommendations.push({
        id: item.id,
        category,
        categoryLabel: result.label,
        title: item.label,
        detail: itemTemplate.replace("{label}", item.label),
        weight: item.weight,
      });
    }
  }

  return recommendations.sort((a, b) => b.weight - a.weight);
}
