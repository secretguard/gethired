"use client";

import { useEffect, useState } from "react";
import { useRole } from "../context/RoleContext";
import { getCvResults } from "../lib/resultsCache";
import { PracticalAssessment } from "../components/PracticalAssessment";
import { RoleGate } from "../components/RoleGate";
import type { Recommendation } from "@/lib/recommendations";

export default function AssessmentPage() {
  const { role } = useRole();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // Reading sessionStorage must be deferred to a client-only effect — this
    // page is statically prerendered, and `window` doesn't exist there.
    const cached = getCvResults();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the external sessionStorage cache, not deriving state from props
    setRecommendations(cached?.[role]?.recommendations ?? []);
  }, [role]);

  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Rule-based scenarios — no AI grading
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Practical Assessment
          </h1>
          <p className="text-balance text-base text-slate">
            Static, checkpoint-based scenarios you can take on their own — no CV screening required first. If
            you&rsquo;ve already screened a CV this session, its gaps feed into the roadmap alongside these results
            automatically.
          </p>
        </div>
        <div className="mt-10 w-full max-w-3xl">
          <PracticalAssessment screeningId={null} recommendations={recommendations} />
        </div>
      </main>
    </RoleGate>
  );
}
