"use client";

import { useRole } from "../context/RoleContext";
import { interviewPrepBank, interviewPrepForRole } from "@/lib/interviewPrep";
import { ROLE_LABELS } from "@/lib/roles";
import { InterviewQuestionList } from "./InterviewQuestionList";

export function InterviewPrepView() {
  const { role } = useRole();
  const content = interviewPrepForRole(role);
  const { behavioralQuestions, behavioralFramework } = interviewPrepBank;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="rounded-2xl bg-paper p-5 shadow-card">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          What to expect — {ROLE_LABELS[role]}
        </p>
        <p className="mt-2 text-sm text-slate">{content.formatNote}</p>
      </div>

      <div className="rounded-2xl bg-paper p-5 shadow-card">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Technical questions
        </p>
        <h2 className="mb-3 font-display font-semibold text-ink">Tap a question to see what it&rsquo;s checking</h2>
        <InterviewQuestionList questions={content.technicalQuestions} />
      </div>

      <div className="rounded-2xl bg-paper p-5 shadow-card">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          Behavioral questions — shared across every track
        </p>
        <h2 className="mb-3 font-display font-semibold text-ink">Same for everyone, whatever your track</h2>
        <InterviewQuestionList questions={behavioralQuestions} />
      </div>

      <div className="rounded-2xl border-2 border-dashed border-slate/30 bg-fog p-5">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
          For the behavioral questions
        </p>
        <h2 className="mb-1 font-display font-semibold text-ink">{behavioralFramework.name}</h2>
        <p className="text-sm text-slate">{behavioralFramework.description}</p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate/70">Worked example</p>
        <dl className="mt-2 flex flex-col gap-2.5">
          {(
            [
              ["Situation", behavioralFramework.workedExample.situation],
              ["Task", behavioralFramework.workedExample.task],
              ["Action", behavioralFramework.workedExample.action],
              ["Result", behavioralFramework.workedExample.result],
            ] as const
          ).map(([label, text]) => (
            <div key={label} className="rounded-lg bg-paper p-3 shadow-border">
              <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-beacon">
                {label}
              </dt>
              <dd className="mt-1 text-sm text-slate">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
