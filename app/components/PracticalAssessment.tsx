"use client";

import { useState } from "react";
import type { AssessmentResult, ScenarioPrompt } from "@/lib/assessment";
import type { Recommendation } from "@/lib/recommendations";
import { generateRoadmap } from "@/lib/roadmap";
import { useRole } from "../context/RoleContext";
import { saveAssessmentResult } from "../lib/resultsCache";
import { AssessmentResultsView } from "./AssessmentResultsView";
import { RoadmapView } from "./RoadmapView";
import { Button } from "./ui/Button";
import { SkeletonBlock, SkeletonLine } from "./ui/Skeleton";

type Status = "idle" | "loading" | "in-progress" | "submitting" | "complete" | "error";

function ScenarioSkeleton() {
  return (
    <div className="rounded-2xl bg-paper p-5 shadow-card">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="mt-2 h-4 w-2/3" />
      <SkeletonLine className="mt-2 h-3 w-full" />
      <SkeletonBlock className="mt-3 h-16 w-full" />
      <SkeletonLine className="mt-4 h-8 w-full" />
    </div>
  );
}

export function PracticalAssessment({
  screeningId,
  recommendations,
}: {
  screeningId: string | null;
  recommendations: Recommendation[];
}) {
  const { role } = useRole();
  const [status, setStatus] = useState<Status>("idle");
  const [scenarios, setScenarios] = useState<ScenarioPrompt[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/assessment?role=${role}`);
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
      role,
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
      <div className="animate-fade-up flex w-full flex-col gap-4">
        <AssessmentResultsView result={result} />
        <RoadmapView steps={generateRoadmap(recommendations, result, role)} role={role} />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="animate-fade-up flex w-full flex-col gap-4">
        {[0, 1].map((index) => (
          <div key={index} style={{ animationDelay: `${index * 60}ms` }} className="animate-fade-up">
            <ScenarioSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (status === "idle" || status === "error") {
    return (
      <div className="animate-fade-up w-full rounded-2xl border-2 border-dashed border-slate/30 bg-paper p-5 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Practical assessment
        </p>
        <p className="mt-1 text-sm text-slate">
          Static, checkpoint-based scenarios — log analysis, networking, vulnerability identification, OWASP Top
          10, and incident-response triage. No live infrastructure, no AI grading — every answer is checked
          against a known-correct value.
        </p>
        {status === "error" && errorMessage && (
          <p className="mt-2 animate-fade-up text-sm text-danger">{errorMessage}</p>
        )}
        <Button onClick={handleStart} className="mt-3">
          Start the practical assessment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <fieldset disabled={status === "submitting"} className="contents">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className="animate-fade-up rounded-2xl bg-paper p-5 shadow-card"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
              PA.{String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display font-semibold text-ink">{scenario.title}</h3>
            <p className="mt-1 text-sm text-slate">{scenario.scenario}</p>
            <p className="mt-3 mb-1 text-xs font-medium uppercase tracking-wide text-slate/70">
              {scenario.artifactLabel}
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-fog p-3 font-mono text-xs text-ink shadow-border">
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
                    className="rounded-lg border border-slate/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 transition-all duration-150 ease-standard focus:border-beacon focus:shadow-[var(--shadow-focus)] focus:outline-none disabled:cursor-not-allowed"
                    placeholder="Your answer"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      {errorMessage && <p className="animate-fade-up text-sm text-danger">{errorMessage}</p>}

      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "submitting" ? "Scoring your answers…" : "Submit assessment"}
      </Button>
    </form>
  );
}
