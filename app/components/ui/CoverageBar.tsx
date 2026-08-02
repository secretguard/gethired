"use client";

import { useEffect, useState } from "react";

/**
 * Shared score bar — previously copy-pasted verbatim in AssessmentResultsView
 * and McqResultsView. Fills from 0 on mount instead of appearing pre-filled,
 * echoing ScoreGauge's stroke animation so every score readout in the app
 * arrives with the same "revealing" motion.
 */
export function CoverageBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate/12">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-standard ${
          score >= 75 ? "bg-verified" : score >= 50 ? "bg-beacon" : "bg-slate"
        }`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
