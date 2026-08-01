import type { CategoryKey, ScoreResult } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import { ResultsView } from "./ResultsView";
import { RecommendationsList } from "./RecommendationsList";
import { PracticalAssessment } from "./PracticalAssessment";

export function ReportView({
  result,
  recommendations,
  resultId,
  preferredCategory,
}: {
  result: ScoreResult;
  recommendations: Recommendation[];
  resultId: string | null;
  preferredCategory?: CategoryKey;
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <ResultsView result={result} />
      <RecommendationsList recommendations={recommendations} preferredCategory={preferredCategory} />
      <PracticalAssessment screeningId={resultId} recommendations={recommendations} />
    </div>
  );
}
