"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "./context/RoleContext";
import { ScanStrip } from "./components/ScanStrip";
import { RoleTrackPicker } from "./components/RoleTrackPicker";
import { ToolCard } from "./components/ToolCard";
import { ROLE_LABELS } from "@/lib/roles";

const TOOLS = [
  {
    href: "/screen",
    code: "CH.00",
    title: "CV Screener",
    description: "Upload your CV, get a match score against real entry-level postings for your track.",
    cta: "Screen my CV",
  },
  {
    href: "/assessment",
    code: "PA.00",
    title: "Practical Assessment",
    description: "Static, checkpoint-based scenarios — log analysis, networking, vulnerability ID, OWASP, incident response.",
    cta: "Start the assessment",
  },
  {
    href: "/quiz",
    code: "QC.00",
    title: "Quick Knowledge Check",
    description: "A fast, lighter-weight MCQ self-check across the same skill categories.",
    cta: "Take the quiz",
  },
  {
    href: "/roadmap",
    code: "RM.00",
    title: "Roadmap",
    description: "A sequenced next-steps plan combining your CV and assessment gaps — start here once you've used the tools above.",
    cta: "View my roadmap",
  },
  {
    href: "/interview-prep",
    code: "IP.00",
    title: "Interview Prep",
    description: "Real, sourced entry-level interview questions for your track, plus shared behavioral questions.",
    cta: "Prep for interviews",
  },
  {
    href: "/resources",
    code: "RL.00",
    title: "Resource Library",
    description: "Real, genuinely free resources for your track, filterable by the skill gaps this app checks for.",
    cta: "Browse resources",
  },
];

export default function Home() {
  const { role, hasSelectedRole } = useRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferring to a client-only effect avoids flashing the picker at
    // returning visitors before the role context finishes hydrating from
    // localStorage — see RoleContext.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with hydration timing, not deriving state from props
    setMounted(true);
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
          Rule-based tools — no AI grading
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">GetHired</h1>
        <ScanStrip />
        <p className="text-balance text-base text-slate">
          Break into cybersecurity with honest, rule-based skill assessment and a real roadmap — not just a CV
          scan.
        </p>
      </div>

      {!mounted ? null : !hasSelectedRole ? (
        <div className="mt-10 flex w-full flex-col items-center gap-6">
          <RoleTrackPicker />
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center gap-3 rounded-full border border-slate/15 bg-paper px-4 py-2">
            <span className="text-sm text-slate">
              Your track: <span className="font-semibold text-ink">{ROLE_LABELS[role]}</span>
            </span>
            <Link href="/find-your-path" className="text-xs font-medium text-beacon underline underline-offset-2">
              Not the right fit?
            </Link>
          </div>

          <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
