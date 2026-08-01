import type { RoadmapStep } from "@/lib/roadmap";

export function RoadmapView({ steps }: { steps: RoadmapStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-slate/15 bg-paper p-5 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">Your roadmap</p>
        <p className="mt-1 text-sm text-slate">
          No major gaps across your CV and assessment results — you're already covering the fundamentals well.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate/15 bg-paper p-5">
      <h3 className="mb-1 font-display font-semibold text-ink">Your roadmap</h3>
      <p className="mb-4 text-sm text-slate">
        A sequenced next-steps plan combining your CV and assessment gaps — start at step 1, work down.
      </p>
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
    </div>
  );
}
