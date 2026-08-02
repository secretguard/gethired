"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { RoleTrackPicker } from "../components/RoleTrackPicker";
import { FindYourPathQuiz } from "../components/FindYourPathQuiz";
import { FindYourPathCvUpload } from "../components/FindYourPathCvUpload";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { ROLES, ROLE_LABELS, type RoleKey } from "@/lib/roles";
import type { FindYourPathRecommendation } from "@/lib/findYourPath";

type Mode = "choose" | "cv" | "quiz";

interface Recommendation {
  role: RoleKey;
  why: string;
  tooClose: boolean;
}

export default function FindYourPathPage() {
  const { selectRole } = useRole();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);

  function handleQuizComplete(rec: FindYourPathRecommendation) {
    const why = rec.tooClose
      ? "Your answers were fairly evenly split across tracks — Generalist keeps every option open while you build a track record."
      : `Your answers lined up most consistently with ${ROLE_LABELS[rec.role]}.`;
    setRecommendation({ role: rec.role, why, tooClose: rec.tooClose });
  }

  function handleUseTrack() {
    if (!recommendation) return;
    selectRole(recommendation.role);
    router.push("/");
  }

  const recommendedDefinition = recommendation ? ROLES.find((r) => r.key === recommendation.role) : null;

  return (
    <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
      <PageHeader
        eyebrow="Not sure which track fits?"
        title="Find Your Path"
        description="Score a CV you already have against all four tracks, or answer a few quick preference questions — either way, a rule-based recommendation, not a locked-in choice. You confirm or pick differently either way."
      />

      {recommendation && recommendedDefinition ? (
        <div className="animate-fade-up mt-10 flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-beacon-soft p-6 text-center shadow-[0_0_0_1.5px_var(--color-beacon)]">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Recommended track
          </span>
          <h2 className="font-display text-2xl font-semibold text-ink">{recommendedDefinition.label}</h2>
          <p className="text-sm text-slate">{recommendedDefinition.description}</p>
          <p className="text-sm text-ink">{recommendation.why}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button onClick={handleUseTrack}>Use this track →</Button>
            <Button variant="secondary" onClick={() => setShowManualPicker(true)}>
              Pick a different track
            </Button>
          </div>
        </div>
      ) : mode === "choose" ? (
        <div className="animate-fade-up mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("cv")}
            className="group flex flex-col items-start gap-2 rounded-2xl bg-paper p-6 text-left shadow-border transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:scale-[0.99]"
          >
            <span className="font-display text-lg font-semibold text-ink transition-colors duration-150 ease-standard group-hover:text-beacon">
              I have a CV ready
            </span>
            <span className="text-sm text-slate">
              Upload it once — scored against all four tracks behind the scenes, then recommends whichever fits
              best.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("quiz")}
            className="group flex flex-col items-start gap-2 rounded-2xl bg-paper p-6 text-left shadow-border transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:scale-[0.99]"
          >
            <span className="font-display text-lg font-semibold text-ink transition-colors duration-150 ease-standard group-hover:text-beacon">
              Answer a few questions
            </span>
            <span className="text-sm text-slate">
              7 quick preference questions, no CV needed — simple rule-based scoring, not AI.
            </span>
          </button>
        </div>
      ) : mode === "cv" ? (
        <div className="animate-fade-up mt-10 w-full">
          <FindYourPathCvUpload onComplete={setRecommendation} />
        </div>
      ) : (
        <div className="animate-fade-up mt-10 w-full">
          <FindYourPathQuiz onComplete={handleQuizComplete} />
        </div>
      )}

      {showManualPicker && (
        <div className="animate-fade-up mt-10 flex w-full flex-col items-center gap-4">
          <RoleTrackPicker onSelect={() => router.push("/")} />
        </div>
      )}
    </main>
  );
}
