import type { CategoryKey, CategoryResult, ScoreResult } from "@/lib/scoring";
import { ScoreGauge } from "./ScoreGauge";

const CATEGORY_ORDER: CategoryKey[] = ["certifications", "tools", "concepts", "soft_skills"];

function CategoryCard({ result }: { result: CategoryResult }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{result.label}</h3>
        <span className="text-sm font-medium text-neutral-500">{result.score}% match</span>
      </div>

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Matched ({result.matched.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.matched.length === 0 && <span className="text-sm text-neutral-400">None found</span>}
          {result.matched.map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Missing ({result.missing.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.missing.length === 0 && <span className="text-sm text-neutral-400">Nothing missing</span>}
          {result.missing.map((item) => (
            <span key={item.id} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResultsView({ result }: { result: ScoreResult }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-8">
        <ScoreGauge score={result.overallScore} label="Overall match" />
        <p className="max-w-md text-center text-sm text-neutral-500">
          Based on how well your CV covers common certifications, tools, concepts, and soft skills found in real
          cybersecurity job postings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORY_ORDER.map((key) => (
          <CategoryCard key={key} result={result.categories[key]} />
        ))}
      </div>
    </div>
  );
}
