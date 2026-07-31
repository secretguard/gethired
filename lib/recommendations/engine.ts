import type { CategoryKey, CategoryResult } from "@/lib/scoring";
import { CATEGORY_ORDER } from "@/lib/scoring";
import { recommendationsConfig } from "./config";
import type { LabScore, Recommendation } from "./types";

/**
 * Education is deliberately excluded from recommendations. Recommending a
 * specific cert, tool, or skill is reasonable career advice; recommending
 * someone change or acquire a specific degree is not — it isn't actionable in
 * any short/medium timeframe, and plenty of legitimate fresher candidates
 * come from non-traditional backgrounds (B.Sc, diploma, self-taught, career
 * switchers). This category never produces a "next step" suggestion.
 */
const RECOMMENDABLE_CATEGORIES: CategoryKey[] = CATEGORY_ORDER.filter((category) => category !== "education");

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

  for (const category of RECOMMENDABLE_CATEGORIES) {
    const result = cvGaps[category];
    const threshold = categoryThresholds[category];
    const messages = categoryMessages[category];
    if (!result || threshold === undefined || !messages || result.score >= threshold) continue;

    const topMissing = [...result.missing].sort((a, b) => b.weight - a.weight).slice(0, topNPerCategory);

    for (const item of topMissing) {
      recommendations.push({
        id: item.id,
        category,
        categoryLabel: result.label,
        title: item.label,
        detail: messages.itemTemplate.replace("{label}", item.label),
        weight: item.weight,
      });
    }
  }

  return recommendations.sort((a, b) => b.weight - a.weight);
}
