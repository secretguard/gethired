"use client";

import { useState } from "react";
import type { McqPrompt, McqResult } from "@/lib/mcq";
import { useRole } from "../context/RoleContext";
import { McqResultsView } from "./McqResultsView";
import { Button } from "./ui/Button";
import { SkeletonBlock, SkeletonLine } from "./ui/Skeleton";

type Status = "idle" | "loading" | "in-progress" | "submitting" | "complete" | "error";

function QuestionSkeleton() {
  return (
    <div className="rounded-2xl bg-paper p-5 shadow-card">
      <SkeletonLine className="h-3 w-10" />
      <SkeletonLine className="mt-2 h-4 w-3/4" />
      <SkeletonBlock className="mt-4 h-9 w-full" />
      <SkeletonBlock className="mt-2 h-9 w-full" />
      <SkeletonBlock className="mt-2 h-9 w-full" />
    </div>
  );
}

export function McqQuiz() {
  const { role } = useRole();
  const [status, setStatus] = useState<Status>("idle");
  const [questions, setQuestions] = useState<McqPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<McqResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/mcq?role=${role}`);
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
      role,
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
    return (
      <div className="animate-fade-up w-full">
        <McqResultsView result={result} role={role} />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="animate-fade-up flex w-full max-w-2xl flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} style={{ animationDelay: `${index * 60}ms` }} className="animate-fade-up">
            <QuestionSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (status === "idle" || status === "error") {
    return (
      <div className="animate-fade-up w-full max-w-md rounded-2xl border-2 border-dashed border-slate/30 bg-paper p-5 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Quick knowledge check
        </p>
        <p className="mt-1 text-sm text-slate">
          A handful of multiple-choice questions across certifications, tools, concepts, scripting, and soft
          skills — a fast self-check, not a replacement for the full practical assessment.
        </p>
        {status === "error" && errorMessage && (
          <p className="mt-2 animate-fade-up text-sm text-danger">{errorMessage}</p>
        )}
        <Button onClick={handleStart} className="mt-3">
          Start the quick check
        </Button>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id]);

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      {questions.map((question, index) => (
        <fieldset
          key={question.id}
          disabled={submitting}
          className="animate-fade-up rounded-2xl bg-paper p-5 shadow-card"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Q{String(index + 1).padStart(2, "0")}
          </legend>
          <p className="mt-1 text-sm font-medium text-ink">{question.question}</p>
          <div className="mt-3 flex flex-col gap-2">
            {question.choices.map((choice) => (
              <label
                key={choice.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate/20 px-3 py-2 text-sm text-ink transition-all duration-150 ease-standard has-[:checked]:border-beacon has-[:checked]:bg-beacon-soft has-[:checked]:shadow-border active:scale-[0.99]"
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

      {errorMessage && <p className="animate-fade-up text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={status === "submitting" || !allAnswered} className="w-full">
        {status === "submitting" && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "submitting" ? "Scoring…" : allAnswered ? "See my results" : "Answer every question to continue"}
      </Button>
    </form>
  );
}
