const DEFAULT_BAR_COUNT = 7;

/**
 * The product's signature "scanning" moment — an equalizer-style readout
 * reused across every screen that's actively analyzing input (CV scoring,
 * assessment grading, MCQ grading). Generalized from what used to be a
 * one-off component (ScoringTransition) so the same motif shows up
 * everywhere the product is genuinely "working", not just on one screen.
 */
export function ScanLoader({
  eyebrow,
  steps,
  compact = false,
}: {
  eyebrow: string;
  steps?: string[];
  compact?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-4 rounded-2xl border border-slate/15 bg-paper text-center shadow-card ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className={`flex items-end gap-1 ${compact ? "h-8" : "h-12"}`} aria-hidden>
        {Array.from({ length: DEFAULT_BAR_COUNT }).map((_, index) => (
          <span
            key={index}
            className="w-1.5 origin-bottom animate-scan-bar rounded-full bg-beacon"
            style={{
              height: compact ? `${12 + (index % 4) * 5}px` : `${16 + (index % 4) * 8}px`,
              animationDelay: `${index * 90}ms`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-slate/70">{eyebrow}</p>
      {steps && steps.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-slate">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
