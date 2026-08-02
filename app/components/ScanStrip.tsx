const TICKS = [3, 5, 4, 7, 5, 9, 6, 11, 7, 14, 8, 18, 22, 18, 8, 14, 7, 11, 6, 9, 5, 7, 4, 5, 3];
const BEACON_INDEX = 12;

/**
 * Decorative signal-scan readout — the page's signature motif. Echoes the
 * product's checkpoint/scan framing (screening a CV, running an assessment)
 * without spelling it out. Purely visual, so it's hidden from assistive tech.
 * Bars rise in on mount, staggered from the center out, so the motif reads
 * as an active "scan" rather than a static bar chart.
 */
export function ScanStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-6 items-end gap-[3px] ${className}`}>
      {TICKS.map((height, index) => (
        <span
          key={index}
          className={`w-[3px] origin-bottom animate-fade-up rounded-full ${
            index === BEACON_INDEX ? "bg-beacon" : "bg-slate/25"
          }`}
          style={{ height: `${height}px`, animationDelay: `${Math.abs(index - BEACON_INDEX) * 25}ms` }}
        />
      ))}
    </div>
  );
}
