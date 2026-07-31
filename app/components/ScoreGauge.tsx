function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreRing(score: number): string {
  if (score >= 75) return "stroke-emerald-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

export function ScoreGauge({ score, label }: { score: number; label: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} className="stroke-neutral-200" strokeWidth="10" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${scoreRing(score)} transition-[stroke-dashoffset] duration-700 ease-out`}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-semibold ${scoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-neutral-600">{label}</span>
    </div>
  );
}
