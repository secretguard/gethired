import type { ScoreResult } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import { ResultsView } from "./ResultsView";
import { RecommendationsList } from "./RecommendationsList";
import { PracticalAssessmentPlaceholder } from "./PracticalAssessmentPlaceholder";

export function ReportView({
  result,
  recommendations,
}: {
  result: ScoreResult;
  recommendations: Recommendation[];
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <ResultsView result={result} />
      <RecommendationsList recommendations={recommendations} />
      <PracticalAssessmentPlaceholder />
    </div>
  );
}
