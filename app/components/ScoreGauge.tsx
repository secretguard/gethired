"use client";

import { useEffect, useState } from "react";

function scoreRing(score: number): string {
  if (score >= 75) return "stroke-verified";
  if (score >= 50) return "stroke-beacon";
  return "stroke-slate";
}

export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} className="stroke-slate/15" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${scoreRing(score)} transition-[stroke-dashoffset] duration-700 ease-standard`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-3xl font-semibold text-ink">{score}</span>
        </div>
      </div>
      <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-slate">{label}</span>
    </div>
  );
}
