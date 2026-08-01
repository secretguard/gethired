"use client";

import { useState } from "react";
import type { McqPrompt, McqResult } from "@/lib/mcq";
import { McqResultsView } from "./McqResultsView";

type Status = "idle" | "loading" | "in-progress" | "submitting" | "complete" | "error";

export function McqQuiz() {
  const [status, setStatus] = useState<Status>("idle");
  const [questions, setQuestions] = useState<McqPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<McqResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/mcq");
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      setQuestions((data.questions as McqPrompt[]) ?? []);
      setStatus("in-progress");
    } catch {
      setStatus("error");
      setErrorMessage("Could not load the quick check. Please try again.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const payload = {
      answers: Object.entries(answers).map(([questionId, choiceId]) => ({ questionId, choiceId })),
    };

    try {
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      setResult(data.result as McqResult);
      setStatus("complete");
    } catch {
      setStatus("in-progress");
      setErrorMessage("Could not submit your answers. Please try again.");
    }
  }

  if (status === "complete" && result) {
    return <McqResultsView result={result} />;
  }

  if (status === "idle" || status === "loading" || status === "error") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-dashed border-slate/30 bg-paper p-5 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Quick knowledge check
        </p>
        <p className="mt-1 text-sm text-slate">
          A handful of multiple-choice questions across certifications, tools, concepts, scripting, and soft
          skills — a fast self-check, not a replacement for the full practical assessment.
        </p>
        {status === "error" && errorMessage && <p className="mt-2 text-sm text-beacon">{errorMessage}</p>}
        <button
          onClick={handleStart}
          disabled={status === "loading"}
          className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Loading…" : "Start the quick check"}
        </button>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      {questions.map((question, index) => (
        <fieldset key={question.id} className="rounded-2xl border border-slate/15 bg-paper p-5">
          <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Q{String(index + 1).padStart(2, "0")}
          </legend>
          <p className="mt-1 text-sm font-medium text-ink">{question.question}</p>
          <div className="mt-3 flex flex-col gap-2">
            {question.choices.map((choice) => (
              <label
                key={choice.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate/20 px-3 py-2 text-sm text-ink transition has-[:checked]:border-beacon has-[:checked]:bg-beacon-soft"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={choice.id}
                  checked={answers[question.id] === choice.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: choice.id }))}
                  className="accent-beacon"
                />
                {choice.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {errorMessage && <p className="text-sm text-beacon">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || !allAnswered}
        className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Scoring…" : allAnswered ? "See my results" : "Answer every question to continue"}
      </button>
    </form>
  );
}
