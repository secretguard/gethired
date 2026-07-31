import type { CategoryResult, ScoreResult } from "@/lib/scoring";
import { OVERALL_SCORE_CATEGORIES, corpusMeta } from "@/lib/scoring";
import { ScoreGauge } from "./ScoreGauge";

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
          Worth adding ({result.missing.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.missing.length === 0 && <span className="text-sm text-neutral-400">Nothing left to add</span>}
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

function EducationCard({ result }: { result: CategoryResult }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 sm:col-span-2 lg:col-span-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{result.label}</h3>
        <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
          Informational — not scored
        </span>
      </div>

      {result.matched.length > 0 ? (
        <>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-400">Detected on your CV</p>
          <div className="flex flex-wrap gap-1.5">
            {result.matched.map((item) => (
              <span
                key={item.id}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
              >
                {item.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-500">
          No specific education background detected on your CV — that&rsquo;s fine, it isn&rsquo;t scored as a
          requirement and doesn&rsquo;t affect your overall match.
        </p>
      )}
    </div>
  );
}

export function ResultsView({ result }: { result: ScoreResult }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-8">
        <ScoreGauge score={result.overallScore} label="Overall match" />
        <p className="max-w-md text-center text-sm text-neutral-500">
          Based on how well your CV covers the certifications, tools, concepts, scripting, and soft skills that
          real entry-level cybersecurity postings (SOC Analyst, VAPT, cybersecurity intern, and similar fresher
          roles) ask for.
        </p>
        <p className="text-xs text-neutral-400">
          Scored against {corpusMeta.name} v{corpusMeta.version}
        </p>
      </div>

      <p className="mb-4 text-center text-xs text-neutral-400">
        &ldquo;Worth adding&rdquo; isn&rsquo;t a checklist of requirements — these show up often in postings for
        this role and could strengthen your profile.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERALL_SCORE_CATEGORIES.map((key) => (
          <CategoryCard key={key} result={result.categories[key]} />
        ))}
        <EducationCard result={result.categories.education} />
      </div>
    </div>
  );
}
