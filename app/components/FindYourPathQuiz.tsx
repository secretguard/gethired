"use client";

import { useState } from "react";
import { FIND_YOUR_PATH_QUESTIONS, scoreQuestionnaire } from "@/lib/findYourPath";
import type { FindYourPathRecommendation } from "@/lib/findYourPath";
import { Button } from "./ui/Button";

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
        <fieldset
          key={question.id}
          className="animate-fade-up rounded-2xl bg-paper p-5 shadow-card"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Q{String(index + 1).padStart(2, "0")}
          </legend>
          <p className="mt-1 text-sm font-medium text-ink">{question.prompt}</p>
          <div className="mt-3 flex flex-col gap-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate/20 px-3 py-2 text-sm text-ink transition-all duration-150 ease-standard has-[:checked]:border-beacon has-[:checked]:bg-beacon-soft has-[:checked]:shadow-border active:scale-[0.99]"
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

      <Button type="submit" disabled={!allAnswered} className="w-full">
        {allAnswered ? "See my recommendation" : "Answer every question to continue"}
      </Button>
    </form>
  );
}
