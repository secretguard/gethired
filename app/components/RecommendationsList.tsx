import type { Recommendation } from "@/lib/recommendations";

export function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="mb-1 font-semibold text-neutral-900">Recommended next steps</h3>

      {recommendations.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No major gaps found — your CV already covers the categories we check well.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {recommendations.map((rec, index) => (
            <li key={rec.id} className="flex gap-3 border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {rec.title}
                  <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-500">
                    {rec.categoryLabel}
                  </span>
                </p>
                <p className="text-sm text-neutral-500">{rec.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
