import Link from "next/link";
import type { InterviewQuestion } from "@/lib/interviewPrep";
import { ASSESSMENT_CATEGORY_LABELS } from "@/lib/assessment";
import { CATEGORY_LABELS } from "@/lib/scoring";
import { useReviewedQuestions } from "../lib/reviewedQuestions";

function testedInLabel(testedIn: NonNullable<InterviewQuestion["testedIn"]>): string {
  return testedIn.tool === "assessment"
    ? ASSESSMENT_CATEGORY_LABELS[testedIn.category as keyof typeof ASSESSMENT_CATEGORY_LABELS]
    : CATEGORY_LABELS[testedIn.category as keyof typeof CATEGORY_LABELS];
}

export function InterviewQuestionList({ questions }: { questions: InterviewQuestion[] }) {
  const { reviewed, toggleReviewed } = useReviewedQuestions();

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => (
        <details
          key={q.id}
          className="group rounded-xl bg-fog p-4 shadow-border transition-all duration-200 ease-standard open:bg-paper open:shadow-card"
        >
          <summary className="flex cursor-pointer list-none items-start gap-3 text-sm font-medium text-ink marker:content-none">
            <span className="font-mono text-xs text-slate/60">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 transition-colors duration-150 ease-standard group-hover:text-beacon">
              {q.question}
            </span>
            {reviewed.has(q.id) && (
              <span
                className="rounded-full bg-verified-soft px-1.5 py-0.5 text-[10px] font-medium text-verified"
                title="Marked as reviewed"
              >
                ✓ reviewed
              </span>
            )}
            <span className="text-slate/50 transition-transform duration-200 ease-standard group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="mt-3 animate-fade-up border-t border-slate/10 pt-3 pl-7">
            <p className="text-sm text-slate">
              <span className="font-semibold text-ink/80">What they&rsquo;re checking: </span>
              {q.whatTheyreChecking}
            </p>

            {q.strongAnswerCovers && q.strongAnswerCovers.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate/70">
                  A strong answer covers
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {q.strongAnswerCovers.map((point) => (
                    <li key={point} className="flex gap-2 text-sm text-slate">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-slate/40" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.testedIn && (
              <p className="mt-3 text-xs text-slate">
                <span className="font-semibold text-ink/80">Think you know this? </span>
                Objectively tested in the{" "}
                <Link
                  href={q.testedIn.tool === "assessment" ? "/assessment" : "/quiz"}
                  className="font-medium text-beacon underline decoration-transparent underline-offset-2 transition-all duration-150 ease-standard hover:decoration-beacon"
                >
                  {q.testedIn.tool === "assessment" ? "Practical Assessment" : "Quick Check"}
                </Link>{" "}
                — {testedInLabel(q.testedIn)}.
              </p>
            )}

            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-slate transition-colors duration-150 ease-standard hover:text-ink">
              <input
                type="checkbox"
                checked={reviewed.has(q.id)}
                onChange={() => toggleReviewed(q.id)}
                className="accent-verified"
              />
              Mark as reviewed
            </label>
          </div>
        </details>
      ))}
    </div>
  );
}
