import { ROLE_LABELS, ROLE_ORDER, DEFAULT_ROLE, type RoleKey } from "@/lib/roles";
import { OVERALL_SCORE_CATEGORIES, CATEGORY_LABELS, type CategoryKey, type ScoreResult } from "@/lib/scoring";

export type CvResultsByRoleForFit = Record<RoleKey, { result: ScoreResult }>;

export interface CvBestFitRecommendation {
  role: RoleKey;
  why: string;
  /** True when no track scored a clear margin higher and the result fell back to Generalist. */
  tooClose: boolean;
}

/** Within this many percentage points of the leader, a second track is treated as "too close to call". */
const TIE_MARGIN_PERCENT = 3;

function topCategory(result: ScoreResult): CategoryKey {
  return [...OVERALL_SCORE_CATEGORIES].sort(
    (a, b) => result.categories[b].score - result.categories[a].score
  )[0];
}

/**
 * Recommends a best-fit role by comparing the CV's already-computed score
 * against all four role corpora (the same scoreCv() output /api/screen
 * already returns) — no new scoring logic, just a comparison over existing
 * results. Falls back to Generalist when no track leads by a clear margin.
 */
export function bestFitFromCvResults(resultsByRole: CvResultsByRoleForFit): CvBestFitRecommendation {
  const ranked = [...ROLE_ORDER].sort(
    (a, b) => resultsByRole[b].result.overallScore - resultsByRole[a].result.overallScore
  );
  const [leader, runnerUp] = ranked;
  const leaderScore = resultsByRole[leader].result.overallScore;
  const runnerUpScore = runnerUp !== undefined ? resultsByRole[runnerUp].result.overallScore : 0;
  const tooClose = runnerUp !== undefined && leaderScore - runnerUpScore < TIE_MARGIN_PERCENT;

  const role = tooClose ? DEFAULT_ROLE : leader;
  const roleResult = resultsByRole[role].result;
  const bestCategory = topCategory(roleResult);

  const why = tooClose
    ? `Your CV scores similarly across tracks (within ${TIE_MARGIN_PERCENT} points of each other) — Generalist keeps every option open while you build a track record.`
    : `Your CV scores highest for ${ROLE_LABELS[role]} at ${roleResult.overallScore}%, driven by strong coverage in ${CATEGORY_LABELS[bestCategory]}.`;

  return { role, why, tooClose };
}
