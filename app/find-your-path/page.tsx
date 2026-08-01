"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { RoleTrackPicker } from "../components/RoleTrackPicker";
import { FindYourPathQuiz } from "../components/FindYourPathQuiz";
import { FindYourPathCvUpload } from "../components/FindYourPathCvUpload";
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
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
          Not sure which track fits?
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Find Your Path</h1>
        <p className="text-balance text-base text-slate">
          Score a CV you already have against all four tracks, or answer a few quick preference questions — either
          way, a rule-based recommendation, not a locked-in choice. You confirm or pick differently either way.
        </p>
      </div>

      {recommendation && recommendedDefinition ? (
        <div className="mt-10 flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-beacon bg-beacon-soft p-6 text-center">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
            Recommended track
          </span>
          <h2 className="font-display text-2xl font-semibold text-ink">{recommendedDefinition.label}</h2>
          <p className="text-sm text-slate">{recommendedDefinition.description}</p>
          <p className="text-sm text-ink">{recommendation.why}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleUseTrack}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90"
            >
              Use this track →
            </button>
            <button
              type="button"
              onClick={() => setShowManualPicker(true)}
              className="rounded-lg border border-slate/30 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-fog"
            >
              Pick a different track
            </button>
          </div>
        </div>
      ) : mode === "choose" ? (
        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("cv")}
            className="flex flex-col items-start gap-2 rounded-2xl border border-slate/15 bg-paper p-6 text-left transition hover:border-beacon"
          >
            <span className="font-display text-lg font-semibold text-ink">I have a CV ready</span>
            <span className="text-sm text-slate">
              Upload it once — scored against all four tracks behind the scenes, then recommends whichever fits
              best.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("quiz")}
            className="flex flex-col items-start gap-2 rounded-2xl border border-slate/15 bg-paper p-6 text-left transition hover:border-beacon"
          >
            <span className="font-display text-lg font-semibold text-ink">Answer a few questions</span>
            <span className="text-sm text-slate">
              7 quick preference questions, no CV needed — simple rule-based scoring, not AI.
            </span>
          </button>
        </div>
      ) : mode === "cv" ? (
        <div className="mt-10 w-full">
          <FindYourPathCvUpload onComplete={setRecommendation} />
        </div>
      ) : (
        <div className="mt-10 w-full">
          <FindYourPathQuiz onComplete={handleQuizComplete} />
        </div>
      )}

      {showManualPicker && (
        <div className="mt-10 flex w-full flex-col items-center gap-4">
          <RoleTrackPicker onSelect={() => router.push("/")} />
        </div>
      )}
    </main>
  );
}
