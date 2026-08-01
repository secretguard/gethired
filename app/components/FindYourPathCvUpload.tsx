"use client";

import { useRef, useState } from "react";
import { saveCvResults, type CvResultsByRole } from "../lib/resultsCache";
import { bestFitFromCvResults, type CvBestFitRecommendation } from "@/lib/findYourPath";
import { DEFAULT_ROLE } from "@/lib/roles";

type Status = "idle" | "loading" | "error";

export function FindYourPathCvUpload({ onComplete }: { onComplete: (rec: CvBestFitRecommendation) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
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

    const formData = new FormData();
    formData.append("file", file);
    // No track picked yet — this scores against all four anyway, so the
    // form field just picks which one gets persisted as "the screening".
    formData.append("role", DEFAULT_ROLE);

    try {
      const response = await fetch("/api/screen", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const results = data.results as CvResultsByRole;
      saveCvResults(results);
      onComplete(bestFitFromCvResults(results));
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <label
        htmlFor="fyp-cv-file"
        className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate/30 bg-paper px-6 py-10 text-center transition hover:border-beacon"
      >
        <span className="mt-1 text-sm font-medium text-ink">
          {fileName ?? "Drop your CV here, or click to choose a file"}
        </span>
        <span className="text-xs text-slate">PDF or DOCX, max 5MB — scored against all four tracks at once</span>
        <input
          ref={inputRef}
          id="fyp-cv-file"
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
        {status === "loading" ? "Scoring against all four tracks…" : "Find my best-fit track"}
      </button>
    </form>
  );
}
