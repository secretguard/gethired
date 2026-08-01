import type { CategoryKey } from "@/lib/scoring";

const SHORT_LABELS: Record<string, string> = {
  certifications: "Certs",
  tools: "Tools",
  concepts_frameworks: "Concepts",
  scripting_programming: "Scripting",
  soft_skills: "Soft skills",
};

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_RADIUS = 85;
const RINGS = [0.25, 0.5, 0.75, 1];
// Extra horizontal room so long labels like "Soft skills" don't clip past
// the viewBox edge when anchored outward from a left/right-side axis point.
const LABEL_PADDING = 45;

function labelAnchor(x: number): "start" | "middle" | "end" {
  if (x > CENTER + 10) return "start";
  if (x < CENTER - 10) return "end";
  return "middle";
}

function pointOnAxis(index: number, total: number, fraction: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return {
    x: CENTER + MAX_RADIUS * fraction * Math.cos(angle),
    y: CENTER + MAX_RADIUS * fraction * Math.sin(angle),
  };
}

function polygonPoints(scores: number[]): string {
  return scores.map((score, index) => pointOnAxis(index, scores.length, score / 100)).map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Hand-rolled SVG radar/hexagon chart — no charting library needed for a
 * handful of static, read-only axes (same reasoning as ScoreGauge's
 * hand-rolled ring: this is simple geometry, not worth a dependency).
 */
export function RadarChart({ categories }: { categories: { key: CategoryKey; label: string; score: number }[] }) {
  const scores = categories.map((c) => c.score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`${-LABEL_PADDING} 0 ${SIZE + LABEL_PADDING * 2} ${SIZE}`}
        className="h-64 w-[22rem]"
      >
        {RINGS.map((fraction) => (
          <polygon
            key={fraction}
            points={categories.map((_, index) => pointOnAxis(index, categories.length, fraction)).map((p) => `${p.x},${p.y}`).join(" ")}
            className="fill-none stroke-slate/15"
            strokeWidth={1}
          />
        ))}

        {categories.map((_, index) => {
          const edge = pointOnAxis(index, categories.length, 1);
          return (
            <line
              key={index}
              x1={CENTER}
              y1={CENTER}
              x2={edge.x}
              y2={edge.y}
              className="stroke-slate/15"
              strokeWidth={1}
            />
          );
        })}

        <polygon points={polygonPoints(scores)} className="fill-beacon/20 stroke-beacon" strokeWidth={2} />

        {categories.map((category, index) => {
          const point = pointOnAxis(index, categories.length, category.score / 100);
          return <circle key={category.key} cx={point.x} cy={point.y} r={3} className="fill-beacon" />;
        })}

        {categories.map((category, index) => {
          const labelPoint = pointOnAxis(index, categories.length, 1.28);
          return (
            <text
              key={category.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={labelAnchor(labelPoint.x)}
              dominantBaseline="middle"
              className="fill-slate font-mono text-[9px] font-medium uppercase tracking-wide"
            >
              {SHORT_LABELS[category.key] ?? category.label}
            </text>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span key={category.key} className="font-mono text-xs text-slate">
            {SHORT_LABELS[category.key] ?? category.label}: <span className="font-semibold text-ink">{category.score}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
