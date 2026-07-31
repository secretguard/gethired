"use client";

import { useRef, useState } from "react";
import type { ScoreResult } from "@/lib/scoring";
import { ResultsView } from "./ResultsView";
import { EmailReportForm } from "./EmailReportForm";

type Status = "idle" | "loading" | "success" | "error";

export function CvScreener() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
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
    setResultId(null);
    setErrorMessage(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (status === "success" && result) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <ResultsView result={result} />
        {resultId && <EmailReportForm resultId={resultId} />}
        <button
          onClick={handleReset}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Screen another CV
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col items-center gap-4">
      <label
        htmlFor="cv-file"
        className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-white px-6 py-10 text-center transition hover:border-neutral-400"
      >
        <span className="text-sm font-medium text-neutral-700">
          {fileName ?? "Click to choose a PDF or DOCX CV"}
        </span>
        <span className="text-xs text-neutral-400">Max 5MB</span>
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
        <p className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Analyzing your CV…" : "Screen my CV"}
      </button>
    </form>
  );
}
