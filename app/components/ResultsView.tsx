import type { CategoryResult, ScoreResult } from "@/lib/scoring";
import { OVERALL_SCORE_CATEGORIES, corpusMeta } from "@/lib/scoring";
import { ScoreGauge } from "./ScoreGauge";

function checkpointCode(index: number): string {
  return `CH.${String(index + 1).padStart(2, "0")}`;
}

function CoverageBar({ score }: { score: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate/12">
      <div
        className={`h-full rounded-full ${score >= 75 ? "bg-verified" : score >= 50 ? "bg-beacon" : "bg-slate"}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function CategoryCard({ result, index }: { result: CategoryResult; index: number }) {
  return (
    <div className="rounded-2xl border border-slate/15 bg-paper p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            {checkpointCode(index)}
          </p>
          <h3 className="font-display font-semibold text-ink">{result.label}</h3>
        </div>
        <span className="font-mono text-sm font-medium text-slate">{result.score}%</span>
      </div>

      <CoverageBar score={result.score} />

      <div className="mt-4 mb-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate/70">
          Matched ({result.matched.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.matched.length === 0 && <span className="text-sm text-slate">None found</span>}
          {result.matched.map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-verified-soft px-2.5 py-1 text-xs font-medium text-verified"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate/70">
          Worth adding ({result.missing.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.missing.length === 0 && <span className="text-sm text-slate">Nothing left to add</span>}
          {result.missing.map((item) => (
            <span key={item.id} className="rounded-full bg-slate/8 px-2.5 py-1 text-xs font-medium text-slate">
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
    <div className="rounded-2xl border border-slate/15 bg-fog p-5 sm:col-span-2 lg:col-span-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">EDU</p>
          <h3 className="font-display font-semibold text-ink">{result.label}</h3>
        </div>
        <span className="rounded-full border border-slate/25 px-2.5 py-0.5 text-xs font-medium text-slate">
          Informational — not scored
        </span>
      </div>

      {result.matched.length > 0 ? (
        <>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate/70">Detected on your CV</p>
          <div className="flex flex-wrap gap-1.5">
            {result.matched.map((item) => (
              <span
                key={item.id}
                className="rounded-full bg-verified-soft px-2.5 py-1 text-xs font-medium text-verified"
              >
                {item.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate">
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
      <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-slate/15 bg-paper p-8">
        <ScoreGauge score={result.overallScore} label="Overall match" />
        <p className="max-w-md text-center text-sm text-slate">
          Based on how well your CV covers the certifications, tools, concepts, scripting, and soft skills that
          real entry-level cybersecurity postings (SOC Analyst, VAPT, cybersecurity intern, and similar fresher
          roles) ask for.
        </p>
        <p className="font-mono text-xs text-slate/70">
          Scored against {corpusMeta.name} v{corpusMeta.version}
        </p>
      </div>

      <p className="mb-4 text-center text-xs text-slate/70">
        &ldquo;Worth adding&rdquo; isn&rsquo;t a checklist of requirements — these show up often in postings for
        this role and could strengthen your profile.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERALL_SCORE_CATEGORIES.map((key, index) => (
          <CategoryCard key={key} result={result.categories[key]} index={index} />
        ))}
        <EducationCard result={result.categories.education} />
      </div>
    </div>
  );
}
