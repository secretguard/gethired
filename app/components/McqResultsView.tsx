import type { McqCategoryKey, McqResult } from "@/lib/mcq";
import { ScoreGauge } from "./ScoreGauge";
import { CoverageBar } from "./ui/CoverageBar";

export function McqResultsView({ result }: { result: McqResult }) {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-slate/15 bg-paper p-8">
        <ScoreGauge score={result.overallScore} label="Quick check score" />
        <p className="max-w-md text-center text-sm text-slate">
          A lighter-weight self-check across the same skill categories as the CV screener — not a substitute for
          the full checkpoint-based practical assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(result.categories) as McqCategoryKey[]).map((key) => {
          const category = result.categories[key];
          return (
            <div key={key} className="rounded-2xl border border-slate/15 bg-paper p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display font-semibold text-ink">{category.label}</h3>
                <span className="font-mono text-sm font-medium text-slate">{category.score}%</span>
              </div>
              <CoverageBar score={category.score} />
              <p className="mt-3 text-xs text-slate">
                {category.correctCount} / {category.total} correct
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {result.questions.map((question) => (
          <div key={question.id} className="rounded-2xl border border-slate/15 bg-paper p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink">{question.question}</p>
              <span
                className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  question.correct ? "bg-verified-soft text-verified" : "bg-beacon-soft text-ink"
                }`}
              >
                {question.correct ? "Correct" : "Missed"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">{question.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
