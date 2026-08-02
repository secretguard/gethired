"use client";

import { useRef, useState } from "react";
import { saveCvResults, type CvResultsByRole } from "../lib/resultsCache";
import { bestFitFromCvResults, type CvBestFitRecommendation } from "@/lib/findYourPath";
import { DEFAULT_ROLE } from "@/lib/roles";
import { Button } from "./ui/Button";

type Status = "idle" | "loading" | "error";

export function FindYourPathCvUpload({ onComplete }: { onComplete: (rec: CvBestFitRecommendation) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-paper px-6 py-10 text-center transition-all duration-150 ease-standard ${
          dragActive ? "border-beacon bg-beacon-soft shadow-card-hover" : "border-slate/30 hover:border-beacon hover:shadow-border"
        }`}
      >
        <span className="mt-1 text-sm font-medium text-ink">
          {fileName ?? (dragActive ? "Drop it" : "Drop your CV here, or click to choose a file")}
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
        <p className="w-full animate-fade-up rounded-lg bg-danger-soft px-4 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "loading" ? "Scoring against all four tracks…" : "Find my best-fit track"}
      </Button>
    </form>
  );
}
