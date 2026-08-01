"use client";

import { useState } from "react";
import { FIND_YOUR_PATH_QUESTIONS, scoreQuestionnaire } from "@/lib/findYourPath";
import type { FindYourPathRecommendation } from "@/lib/findYourPath";

export function FindYourPathQuiz({ onComplete }: { onComplete: (rec: FindYourPathRecommendation) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const allAnswered = FIND_YOUR_PATH_QUESTIONS.every((q) => answers[q.id]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onComplete(scoreQuestionnaire(answers));
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      {FIND_YOUR_PATH_QUESTIONS.map((question, index) => (
        <fieldset key={question.id} className="rounded-2xl border border-slate/15 bg-paper p-5">
          <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Q{String(index + 1).padStart(2, "0")}
          </legend>
          <p className="mt-1 text-sm font-medium text-ink">{question.prompt}</p>
          <div className="mt-3 flex flex-col gap-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate/20 px-3 py-2 text-sm text-ink transition has-[:checked]:border-beacon has-[:checked]:bg-beacon-soft"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  className="accent-beacon"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={!allAnswered}
        className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {allAnswered ? "See my recommendation" : "Answer every question to continue"}
      </button>
    </form>
  );
}
