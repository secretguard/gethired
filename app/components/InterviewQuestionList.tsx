import type { InterviewQuestion } from "@/lib/interviewPrep";

export function InterviewQuestionList({ questions }: { questions: InterviewQuestion[] }) {
  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => (
        <details key={q.id} className="group rounded-xl border border-slate/15 bg-fog p-4 open:bg-paper">
          <summary className="flex cursor-pointer list-none items-start gap-3 text-sm font-medium text-ink marker:content-none">
            <span className="font-mono text-xs text-slate/60">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">{q.question}</span>
            <span className="text-slate/50 transition group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-3 border-t border-slate/10 pt-3 pl-7 text-sm text-slate">
            <span className="font-semibold text-ink/80">What they&rsquo;re checking: </span>
            {q.whatTheyreChecking}
          </p>
        </details>
      ))}
    </div>
  );
}
