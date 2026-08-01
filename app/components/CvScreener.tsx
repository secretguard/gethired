"use client";

import { useRef, useState } from "react";
import type { ScoreResult } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import { ReportView } from "./ReportView";
import { EmailReportForm } from "./EmailReportForm";

type Status = "idle" | "loading" | "success" | "error";

export function CvScreener() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [resultId, setResultId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setStatus("error");
      setErrorMessage("Choose a PDF or DOCX file first.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/screen", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data.result as ScoreResult);
      setRecommendations((data.recommendations as Recommendation[]) ?? []);
      setResultId((data.resultId as string | null) ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please try again.");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setRecommendations([]);
    setResultId(null);
    setErrorMessage(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (status === "success" && result) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <ReportView result={result} recommendations={recommendations} resultId={resultId} />
        {resultId && <EmailReportForm resultId={resultId} />}
        <button
          onClick={handleReset}
          className="rounded-lg border border-slate/30 px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper"
        >
          Screen another CV
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <label
        htmlFor="cv-file"
        className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate/30 bg-paper px-6 py-10 text-center transition hover:border-beacon"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          CH.00 — Intake
        </span>
        <span className="mt-1 text-sm font-medium text-ink">
          {fileName ?? "Drop your CV here, or click to choose a file"}
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

      {status === "error" && errorMessage && (
        <p className="w-full rounded-lg bg-beacon-soft px-4 py-2 text-sm text-ink">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Running the scan…" : "Screen my CV"}
      </button>
    </form>
  );
}
