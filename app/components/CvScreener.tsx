"use client";

import { useRef, useState } from "react";
import { useRole } from "../context/RoleContext";
import { saveCvResults, type CvResultsByRole } from "../lib/resultsCache";
import { ReportView } from "./ReportView";
import { EmailReportForm } from "./EmailReportForm";
import { ScoringTransition } from "./ScoringTransition";
import { Button } from "./ui/Button";
import { OVERALL_SCORE_CATEGORIES, CATEGORY_LABELS, type CategoryKey } from "@/lib/scoring";

type Status = "idle" | "scoring" | "success" | "error";

const JOBS_APPLIED_OPTIONS = ["Haven't started yet", "1-5", "6-20", "20+"];

export function CvScreener() {
  const { role } = useRole();
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobsApplied, setJobsApplied] = useState("");
  const [preferredCategory, setPreferredCategory] = useState<CategoryKey | "">("");
  const [resultsByRole, setResultsByRole] = useState<CvResultsByRole | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file || !inputRef.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    setFileName(file.name);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setStatus("error");
      setErrorMessage("Choose a PDF or DOCX file first.");
      return;
    }

    setStatus("scoring");
    setErrorMessage(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    // A minimum visible duration for the scoring transition, so it doesn't
    // just flash instantly on a fast connection — the work itself (the
    // fetch below) is genuinely happening in this window, this just avoids
    // a jarring flicker.
    const minDuration = new Promise((resolve) => setTimeout(resolve, 900));

    try {
      const [response] = await Promise.all([fetch("/api/screen", { method: "POST", body: formData }), minDuration]);
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const results = data.results as CvResultsByRole;
      setResultsByRole(results);
      saveCvResults(results);
      setResultId((data.resultId as string | null) ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please try again.");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResultsByRole(null);
    setResultId(null);
    setErrorMessage(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (status === "scoring") {
    return (
      <div className="animate-fade-up w-full">
        <ScoringTransition />
      </div>
    );
  }

  if (status === "success" && resultsByRole) {
    const current = resultsByRole[role];
    return (
      <div className="animate-fade-up flex w-full flex-col items-center gap-6">
        {jobsApplied && (
          <p className="text-center text-xs text-slate">
            You&rsquo;ve applied to <span className="font-semibold text-ink">{jobsApplied}</span> roles so far —
            here&rsquo;s what could move the needle next.
          </p>
        )}
        <ReportView
          result={current.result}
          recommendations={current.recommendations}
          resultId={resultId}
          preferredCategory={preferredCategory || undefined}
        />
        {resultId && <EmailReportForm resultId={resultId} />}
        <Button variant="secondary" onClick={handleReset}>
          Screen another CV
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <label
        htmlFor="cv-file"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-paper px-6 py-10 text-center transition-all duration-150 ease-standard ${
          dragActive ? "border-beacon bg-beacon-soft shadow-card-hover" : "border-slate/30 hover:border-beacon hover:shadow-border"
        }`}
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          CH.00 — Intake
        </span>
        <span className="mt-1 text-sm font-medium text-ink">
          {fileName ?? (dragActive ? "Drop it" : "Drop your CV here, or click to choose a file")}
        </span>
        <span className="text-xs text-slate">PDF or DOCX, max 5MB</span>
        <input
          ref={inputRef}
          id="cv-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </label>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-left">
          <span className="text-xs font-medium text-slate">How many jobs have you applied to? (optional)</span>
          <select
            value={jobsApplied}
            onChange={(event) => setJobsApplied(event.target.value)}
            className="rounded-lg border border-slate/25 bg-paper px-2.5 py-2 text-sm text-ink transition-all duration-150 ease-standard focus:border-beacon focus:shadow-[var(--shadow-focus)] focus:outline-none"
          >
            <option value="">Prefer not to say</option>
            {JOBS_APPLIED_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-left">
          <span className="text-xs font-medium text-slate">What do you want fixed first? (optional)</span>
          <select
            value={preferredCategory}
            onChange={(event) => setPreferredCategory(event.target.value as CategoryKey | "")}
            className="rounded-lg border border-slate/25 bg-paper px-2.5 py-2 text-sm text-ink transition-all duration-150 ease-standard focus:border-beacon focus:shadow-[var(--shadow-focus)] focus:outline-none"
          >
            <option value="">No preference</option>
            {OVERALL_SCORE_CATEGORIES.map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "error" && errorMessage && (
        <p className="w-full animate-fade-up rounded-lg bg-danger-soft px-4 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" className="w-full">
        Screen my CV
      </Button>
    </form>
  );
}
