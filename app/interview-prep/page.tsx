import { InterviewPrepView } from "../components/InterviewPrepView";
import { RoleGate } from "../components/RoleGate";

export default function InterviewPrepPage() {
  return (
    <RoleGate>
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Real, sourced questions — not AI-generated
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Interview Prep</h1>
          <p className="text-balance text-base text-slate">
            Real entry-level interview questions for your track, plus shared behavioral questions — sourced from
            published interview guides, not invented.
          </p>
        </div>
        <div className="mt-10 flex w-full justify-center">
          <InterviewPrepView />
        </div>
      </main>
    </RoleGate>
  );
}
