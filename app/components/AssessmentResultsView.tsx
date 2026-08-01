import type { AssessmentCategoryKey, AssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_CATEGORY_ORDER } from "@/lib/assessment";
import { ScoreGauge } from "./ScoreGauge";

function checkpointCode(index: number): string {
  return `PA.${String(index + 1).padStart(2, "0")}`;
}

function CoverageBar({ score }: { score: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate/12">
      <div
        className={`h-full rounded-full ${score >= 75 ? "bg-verified" : score >= 50 ? "bg-beacon" : "bg-slate"}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function AssessmentCategoryCard({
  categoryKey,
  index,
  result,
}: {
  categoryKey: AssessmentCategoryKey;
  index: number;
  result: AssessmentResult["categories"][AssessmentCategoryKey];
}) {
  return (
    <div className="rounded-2xl border border-slate/15 bg-paper p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            {checkpointCode(index)}
          </p>
          <h3 className="font-display font-semibold text-ink">{result.label}</h3>
        </div>
        <span className="font-mono text-sm font-medium text-slate">{result.score}%</span>
      </div>
      <CoverageBar score={result.score} />
      <p className="mt-3 text-xs text-slate">
        {result.earnedPoints} / {result.totalPoints} points
      </p>
    </div>
  );
}

export function AssessmentResultsView({ result }: { result: AssessmentResult }) {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-slate/15 bg-paper p-8">
        <ScoreGauge score={result.overallScore} label="Assessment score" />
        <p className="max-w-md text-center text-sm text-slate">
          Based on static, checkpoint-style scenarios covering log analysis, networking, vulnerability
          identification, OWASP Top 10 recognition, and incident-response triage — scored with exact-match rules,
          no AI grading.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ASSESSMENT_CATEGORY_ORDER.map((key, index) => (
          <AssessmentCategoryCard key={key} categoryKey={key} index={index} result={result.categories[key]} />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {result.scenarios.map((scenario) => (
          <div key={scenario.id} className="rounded-2xl border border-slate/15 bg-paper p-5">
            <h4 className="font-display font-semibold text-ink">{scenario.title}</h4>
            <ul className="mt-3 flex flex-col gap-3">
              {scenario.checkpoints.map((checkpoint) => (
                <li key={checkpoint.id} className="border-t border-slate/10 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{checkpoint.question}</p>
                    <span
                      className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        checkpoint.correct ? "bg-verified-soft text-verified" : "bg-beacon-soft text-ink"
                      }`}
                    >
                      {checkpoint.correct ? "Correct" : "Missed"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate">
                    Your answer: <span className="italic">{checkpoint.submittedAnswer || "(no answer)"}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate">{checkpoint.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
