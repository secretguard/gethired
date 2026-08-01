const STEPS = ["Reading your CV", "Matching against real job-posting keywords", "Scoring each category"];

/**
 * Brief transition shown while /api/screen is scoring. Copy is deliberately
 * honest — this is a real (if fast) keyword-matching pass against the
 * static corpus, never an "AI analyzing your resume" claim.
 */
export function ScoringTransition() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate/15 bg-paper p-8 text-center">
      <div className="flex h-12 items-end gap-1" aria-hidden>
        {Array.from({ length: 7 }).map((_, index) => (
          <span
            key={index}
            className="w-1.5 animate-pulse rounded-full bg-beacon"
            style={{
              height: `${16 + (index % 4) * 8}px`,
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-slate/70">
        Scoring against real job-posting data — no live AI analysis
      </p>
      <ul className="flex flex-col gap-1 text-sm text-slate">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </div>
  );
}
