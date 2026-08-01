"use client";

import { useState } from "react";
import type { AssessmentResult, ScenarioPrompt } from "@/lib/assessment";
import type { Recommendation } from "@/lib/recommendations";
import { generateRoadmap } from "@/lib/roadmap";
import { saveAssessmentResult } from "../lib/resultsCache";
import { AssessmentResultsView } from "./AssessmentResultsView";
import { RoadmapView } from "./RoadmapView";

type Status = "idle" | "loading" | "in-progress" | "submitting" | "complete" | "error";

export function PracticalAssessment({
  screeningId,
  recommendations,
}: {
  screeningId: string | null;
  recommendations: Recommendation[];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [scenarios, setScenarios] = useState<ScenarioPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/assessment");
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      setScenarios((data.scenarios as ScenarioPrompt[]) ?? []);
      setStatus("in-progress");
    } catch {
      setStatus("error");
      setErrorMessage("Could not load the assessment. Please try again.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const payload = {
      answers: Object.entries(answers).map(([checkpointId, answer]) => ({ checkpointId, answer })),
      screeningId,
    };

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      const assessmentResult = data.result as AssessmentResult;
      setResult(assessmentResult);
      saveAssessmentResult(assessmentResult);
      setStatus("complete");
    } catch {
      setStatus("in-progress");
      setErrorMessage("Could not submit your answers. Please try again.");
    }
  }

  if (status === "complete" && result) {
    return (
      <div className="flex w-full flex-col gap-4">
        <AssessmentResultsView result={result} />
        <RoadmapView steps={generateRoadmap(recommendations, result)} />
      </div>
    );
  }

  if (status === "idle" || status === "loading" || status === "error") {
    return (
      <div className="w-full rounded-2xl border border-dashed border-slate/30 bg-paper p-5 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Practical assessment
        </p>
        <p className="mt-1 text-sm text-slate">
          Static, checkpoint-based scenarios — log analysis, networking, vulnerability identification, OWASP Top
          10, and incident-response triage. No live infrastructure, no AI grading — every answer is checked
          against a known-correct value.
        </p>
        {status === "error" && errorMessage && <p className="mt-2 text-sm text-beacon">{errorMessage}</p>}
        <button
          onClick={handleStart}
          disabled={status === "loading"}
          className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Loading…" : "Start the practical assessment"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {scenarios.map((scenario, index) => (
        <div key={scenario.id} className="rounded-2xl border border-slate/15 bg-paper p-5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            PA.{String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display font-semibold text-ink">{scenario.title}</h3>
          <p className="mt-1 text-sm text-slate">{scenario.scenario}</p>
          <p className="mt-3 mb-1 text-xs font-medium uppercase tracking-wide text-slate/70">
            {scenario.artifactLabel}
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-fog p-3 font-mono text-xs text-ink">
            {scenario.artifact}
          </pre>
          <div className="mt-4 flex flex-col gap-3">
            {scenario.checkpoints.map((checkpoint) => (
              <label key={checkpoint.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-ink">{checkpoint.question}</span>
                <input
                  type="text"
                  value={answers[checkpoint.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [checkpoint.id]: event.target.value }))
                  }
                  className="rounded-lg border border-slate/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-beacon focus:outline-none"
                  placeholder="Your answer"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {errorMessage && <p className="text-sm text-beacon">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Scoring your answers…" : "Submit assessment"}
      </button>
    </form>
  );
}
