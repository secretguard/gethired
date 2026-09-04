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
      <div className="w-full rounded-2xl bg-paper p-5 shadow-card">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">1:1 Mentorship</p>
        <h3 className="mb-1 mt-1.5 font-display font-semibold text-ink">Want a human to review this?</h3>
        <p className="mb-4 text-sm text-slate">
          This report is rule-based. If you want a practitioner to read your gaps and build a
          plan with you, Sarath mentors people 1:1 into security roles. The first call is free.
        </p>
        <a
          href="https://sarathg.me/coaching/"
          target="_blank"
          rel="noopener"
          data-sg-placement="gethired-report"
          className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-card transition-all duration-150 ease-standard hover:bg-ink/90 hover:shadow-card-hover active:scale-[0.97]"
        >
          See how 1:1 mentorship works →
        </a>
      </div>
    </div>
  );
}
