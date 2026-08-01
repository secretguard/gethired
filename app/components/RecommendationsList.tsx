"use client";

import { useState } from "react";
import type { CategoryKey } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";

function orderByPreference(recommendations: Recommendation[], preferredCategory?: CategoryKey): Recommendation[] {
  if (!preferredCategory) return recommendations;
  const preferred = recommendations.filter((rec) => rec.category === preferredCategory);
  const rest = recommendations.filter((rec) => rec.category !== preferredCategory);
  return [...preferred, ...rest];
}

export function RecommendationsList({
  recommendations,
  preferredCategory,
}: {
  recommendations: Recommendation[];
  preferredCategory?: CategoryKey;
}) {
  const ordered = orderByPreference(recommendations, preferredCategory);
  const [rawIndex, setRawIndex] = useState(0);
  const index = ordered.length === 0 ? 0 : Math.min(rawIndex, ordered.length - 1);
  const current = ordered[index];

  return (
    <div className="w-full rounded-2xl border border-slate/15 bg-paper p-5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
        Section 3 — Concrete suggestions
      </p>
      <h3 className="mb-1 font-display font-semibold text-ink">Worth adding, one at a time</h3>

      {ordered.length === 0 ? (
        <p className="text-sm text-slate">
          No major gaps found — your CV already covers the categories we check well.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          <p className="text-xs font-medium text-slate">
            {index + 1} of {ordered.length}
          </p>
          <div className="rounded-xl border border-slate/15 bg-fog p-4">
            <span className="rounded-full bg-slate/10 px-2.5 py-0.5 text-xs font-medium text-slate">
              {current.categoryLabel}
            </span>
            <p className="mt-2 text-base font-semibold text-ink">{current.title}</p>
            <p className="mt-1 text-sm text-slate">{current.detail}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setRawIndex((prev) => Math.max(0, prev - 1))}
              disabled={index === 0}
              className="rounded-lg border border-slate/25 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-fog disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => setRawIndex((prev) => Math.min(ordered.length - 1, prev + 1))}
              disabled={index === ordered.length - 1}
              className="rounded-lg border border-slate/25 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-fog disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
