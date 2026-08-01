import type { Recommendation } from "@/lib/recommendations";
import { DISPLAY_RECOMMENDATION_LIMIT } from "@/lib/recommendations";

export function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  const curated = recommendations.slice(0, DISPLAY_RECOMMENDATION_LIMIT);

  return (
    <div className="w-full rounded-2xl border border-slate/15 bg-paper p-5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
        Section 3 — Concrete suggestions
      </p>
      <h3 className="mb-1 font-display font-semibold text-ink">Prioritized next steps</h3>

      {curated.length === 0 ? (
        <p className="text-sm text-slate">
          No major gaps found — your CV already covers the categories we check well.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {curated.map((rec, index) => (
            <li key={rec.id} className="flex gap-3 border-t border-slate/10 pt-3 first:border-t-0 first:pt-0">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-paper">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {rec.title}
                  <span className="ml-2 rounded-full bg-slate/8 px-2 py-0.5 text-xs font-normal text-slate">
                    {rec.categoryLabel}
                  </span>
                </p>
                <p className="text-sm text-slate">{rec.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
