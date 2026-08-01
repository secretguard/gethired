import type { ScoreResult } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import { ResultsView } from "./ResultsView";
import { RecommendationsList } from "./RecommendationsList";
import { PracticalAssessment } from "./PracticalAssessment";

export function ReportView({
  result,
  recommendations,
  resultId,
}: {
  result: ScoreResult;
  recommendations: Recommendation[];
  resultId: string | null;
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <ResultsView result={result} />
      <RecommendationsList recommendations={recommendations} />
      <PracticalAssessment screeningId={resultId} />
    </div>
  );
}
