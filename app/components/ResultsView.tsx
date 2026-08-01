import type { CategoryResult, MatchedItem, ScoreResult } from "@/lib/scoring";
import { OVERALL_SCORE_CATEGORIES, CATEGORY_LABELS, corpusMeta } from "@/lib/scoring";
import { ScoreGauge } from "./ScoreGauge";
import { RadarChart } from "./RadarChart";

function SectionLabel({ code, title }: { code: string; title: string }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
      {code} — {title}
    </p>
  );
}

function MatchedChip({ item }: { item: MatchedItem }) {
  return (
    <span
      className="rounded-full bg-verified-soft px-2.5 py-1 text-xs font-medium text-verified"
      title={item.impliedBy ? `Credited from: ${item.impliedBy.join(", ")}` : undefined}
    >
      {item.label}
      {item.impliedBy && <span className="ml-1 font-normal text-verified/70">· via {item.impliedBy[0]}</span>}
    </span>
  );
}

function StrengthsSummary({ result }: { result: ScoreResult }) {
  const allMatched = OVERALL_SCORE_CATEGORIES.flatMap((key) => result.categories[key].matched).sort(
    (a, b) => b.weight - a.weight
  );

  return (
    <div className="mb-4 w-full rounded-2xl border border-slate/15 bg-paper p-5">
      <SectionLabel code="Section 1" title="What's good" />
      <h3 className="mb-3 font-display font-semibold text-ink">Matched strengths ({allMatched.length})</h3>

      {allMatched.length === 0 ? (
        <p className="text-sm text-slate">
          No matches yet — upload a CV that lists your certifications, tools, and skills to see your strengths
          here.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {allMatched.map((item) => (
            <MatchedChip key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCoverage({ result }: { result: ScoreResult }) {
  const categories = OVERALL_SCORE_CATEGORIES.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    score: result.categories[key].score,
  }));

  return (
    <div className="mb-4 w-full rounded-2xl border border-slate/15 bg-paper p-5">
      <SectionLabel code="Section 2" title="Category coverage" />
      <h3 className="mb-3 font-display font-semibold text-ink">How you cover each category</h3>
      <div className="flex justify-center">
        <RadarChart categories={categories} />
      </div>
    </div>
  );
}

function EducationCard({ result }: { result: CategoryResult }) {
  return (
    <div className="rounded-2xl border border-slate/15 bg-fog p-5">
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

      <StrengthsSummary result={result} />

      <CategoryCoverage result={result} />

      <EducationCard result={result.categories.education} />
    </div>
  );
}
