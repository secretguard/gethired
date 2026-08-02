"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { certPathForRole } from "@/lib/roadmap";
import type { RoadmapStep } from "@/lib/roadmap";
import type { RoleKey } from "@/lib/roles";
import { ROLE_SHORT_LABELS } from "@/lib/roles";
import { ProjectIdeasPanel } from "./ProjectIdeasPanel";
import { RoadmapResourcesPanel } from "./RoadmapResourcesPanel";

// react-organizational-chart touches `document` at module scope, which
// breaks Next.js's server-side prerender pass even inside a "use client"
// component — load it client-only.
const RoadmapDiagram = dynamic(() => import("./RoadmapDiagram").then((mod) => mod.RoadmapDiagram), { ssr: false });

function RoadmapList({ steps }: { steps: RoadmapStep[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4">
          <div className="flex flex-none flex-col items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-sm font-semibold text-paper">
              {step.step}
            </span>
            {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate/20" />}
          </div>
          <div className="flex-1 pb-2">
            <h4 className="font-display font-semibold text-ink">{step.title}</h4>
            <p className="mt-0.5 text-sm text-slate">{step.intro}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {step.actions.map((action) => (
                <li key={action.id} className="flex gap-2 text-sm">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${
                      action.source === "cv" ? "bg-beacon" : "bg-verified"
                    }`}
                  />
                  <span>
                    <span className="font-medium text-ink">{action.label}</span>
                    <span className="text-slate"> — {action.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CertPath({ role }: { role: RoleKey }) {
  const certs = certPathForRole(role);
  return (
    <div className="mt-4 rounded-xl bg-fog p-4 shadow-border">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
        {ROLE_SHORT_LABELS[role]} certification path
      </p>
      <ol className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink">
        {certs.map((cert, index) => (
          <li key={cert} className="flex items-center gap-2">
            <span className="rounded-full bg-paper px-2.5 py-1 font-medium shadow-border">{cert}</span>
            {index < certs.length - 1 && <span className="text-slate/50">&rarr;</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RoadmapView({ steps, role }: { steps: RoadmapStep[]; role: RoleKey }) {
  const [view, setView] = useState<"diagram" | "list">("diagram");

  if (steps.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-paper p-5 text-center shadow-card">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">Your roadmap</p>
        <p className="mt-1 text-sm text-slate">
          No major gaps across your CV and assessment results — you&rsquo;re already covering the fundamentals well.
        </p>
        <CertPath role={role} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-paper p-5 shadow-card">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-ink">Your roadmap</h3>
        <div className="flex gap-1 rounded-lg bg-fog p-0.5 shadow-border">
          <button
            type="button"
            onClick={() => setView("diagram")}
            aria-pressed={view === "diagram"}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 ease-standard active:scale-[0.96] ${
              view === "diagram" ? "bg-ink text-paper shadow-card" : "text-slate hover:text-ink"
            }`}
          >
            Diagram
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 ease-standard active:scale-[0.96] ${
              view === "list" ? "bg-ink text-paper shadow-card" : "text-slate hover:text-ink"
            }`}
          >
            List
          </button>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate">
        A sequenced next-steps plan combining your CV and assessment gaps — start at step 1, work down.
      </p>
      <div key={view} className="animate-fade-up">
        {view === "diagram" ? <RoadmapDiagram steps={steps} /> : <RoadmapList steps={steps} />}
      </div>
      <ProjectIdeasPanel steps={steps} />
      <RoadmapResourcesPanel steps={steps} />
      <CertPath role={role} />
    </div>
  );
}
