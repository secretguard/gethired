import type { McqCategoryKey, McqResult } from "@/lib/mcq";
import type { RoleKey } from "@/lib/roles";
import { resourcesForCategories } from "@/lib/resources";
import { ScoreGauge } from "./ScoreGauge";
import { CoverageBar } from "./ui/CoverageBar";

/** Fast, lightweight pointer to 1-2 resources for a category someone missed
 * questions in — reuses the same Resource Library matching as the Roadmap's
 * resource panel, just presented smaller since the Quiz is the fast tool. */
function CategoryResourceLinks({ role, category }: { role: RoleKey; category: McqCategoryKey }) {
  const resources = resourcesForCategories(role, [category]).slice(0, 2);
  if (resources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate/10 pt-3">
      <p className="text-xs font-medium text-slate">Missed this category? Here&rsquo;s where to start:</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {resources.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-verified transition-all duration-150 ease-standard hover:underline"
            >
              {resource.title} →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function McqResultsView({ result, role }: { result: McqResult; role: RoleKey }) {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl bg-paper p-8 shadow-card">
        <ScoreGauge score={result.overallScore} label="Quick check score" />
        <p className="max-w-md text-center text-sm text-slate">
          A lighter-weight self-check across the same skill categories as the CV screener — not a substitute for
          the full checkpoint-based practical assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(result.categories) as McqCategoryKey[]).map((key) => {
          const category = result.categories[key];
          return (
            <div key={key} className="rounded-2xl bg-paper p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-display font-semibold text-ink">{category.label}</h3>
                <span className="font-mono text-sm font-medium text-slate">{category.score}%</span>
              </div>
              <CoverageBar score={category.score} />
              <p className="mt-3 text-xs text-slate">
                {category.correctCount} / {category.total} correct
              </p>
              {category.total > 0 && category.score < 100 && <CategoryResourceLinks role={role} category={key} />}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {result.questions.map((question) => (
          <div key={question.id} className="rounded-2xl bg-paper p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink">{question.question}</p>
              <span
                className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  question.correct ? "bg-verified-soft text-verified" : "bg-beacon-soft text-ink"
                }`}
              >
                {question.correct ? "Correct" : "Missed"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate">{question.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
