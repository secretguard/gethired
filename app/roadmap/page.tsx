"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "../context/RoleContext";
import { getCvResults, getAssessmentResult } from "../lib/resultsCache";
import { generateRoadmap } from "@/lib/roadmap";
import type { AssessmentResult } from "@/lib/assessment";
import { RoadmapView } from "../components/RoadmapView";
import { RoleGate } from "../components/RoleGate";

export default function RoadmapPage() {
  const { role } = useRole();
  const [ready, setReady] = useState(false);
  const [hasAnySource, setHasAnySource] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [steps, setSteps] = useState<ReturnType<typeof generateRoadmap>>([]);

  useEffect(() => {
    // Reading sessionStorage must be deferred to a client-only effect — this
    // page is statically prerendered, and `window` doesn't exist there.
    const cvResults = getCvResults();
    const cachedAssessment = getAssessmentResult();
    const recommendations = cvResults?.[role]?.recommendations ?? [];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the external sessionStorage cache, not deriving state from props
    setAssessment(cachedAssessment);
    setHasAnySource(Boolean(cvResults) || Boolean(cachedAssessment));
    setSteps(generateRoadmap(recommendations, cachedAssessment, role));
    setReady(true);
  }, [role]);

  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Sequenced next steps
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Roadmap</h1>
          <p className="text-balance text-base text-slate">
            Combines your CV Screener and Practical Assessment gaps for the {role.replaceAll("_", " ")} track into a
            sequenced plan — start at step 1, work down.
          </p>
        </div>

        <div className="mt-10 w-full max-w-3xl">
          {!ready ? null : !hasAnySource ? (
            <div className="w-full rounded-2xl border border-dashed border-slate/30 bg-paper p-6 text-center">
              <p className="text-sm text-slate">
                No results yet this session. Screen a CV and/or take the practical assessment first, then come back —
                this page picks up whatever you&rsquo;ve already done, in this browser tab, automatically.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/screen"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90"
                >
                  Screen my CV
                </Link>
                <Link
                  href="/assessment"
                  className="rounded-lg border border-slate/30 px-4 py-2 text-sm font-medium text-ink transition hover:bg-fog"
                >
                  Take the assessment
                </Link>
              </div>
            </div>
          ) : (
            <>
              {!assessment && (
                <p className="mb-4 text-center text-xs text-slate/70">
                  This roadmap is based on your CV screening only — take the practical assessment too for a fuller
                  picture.
                </p>
              )}
              <RoadmapView steps={steps} role={role} />
            </>
          )}
        </div>
      </main>
    </RoleGate>
  );
}
