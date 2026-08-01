import { Tree, TreeNode } from "react-organizational-chart";
import type { RoadmapStep } from "@/lib/roadmap";

function StageCard({ step }: { step: RoadmapStep }) {
  return (
    <div className="inline-flex w-36 flex-col rounded-2xl border border-slate/20 bg-paper p-2.5 text-left shadow-sm sm:w-56 sm:p-3">
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-slate/70 sm:text-[10px]">
        Step {step.step}
      </p>
      <p className="mt-0.5 text-xs font-display font-semibold leading-snug text-ink sm:text-sm">{step.title}</p>
    </div>
  );
}

function ActionLeaf({ action }: { action: RoadmapStep["actions"][number] }) {
  return (
    <div className="inline-flex w-28 flex-col rounded-xl border border-slate/15 bg-fog p-2 text-left sm:w-44 sm:p-2.5">
      <span
        className={`mb-1 inline-flex w-fit rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide sm:text-[9px] ${
          action.source === "cv" ? "bg-beacon-soft text-ink" : "bg-verified-soft text-verified"
        }`}
      >
        {action.source === "cv" ? "CV" : "Assessment"}
      </span>
      <p className="text-[11px] font-medium leading-snug text-ink sm:text-xs">{action.label}</p>
    </div>
  );
}

/**
 * Each stage gets its own small, independent tree (stage card branching into
 * its 1-3 action leaves) rather than one giant nested tree for the whole
 * roadmap — react-organizational-chart sums child widths at every level, so
 * chaining every stage's continuation as a sibling of the previous stage's
 * action leaves made total width balloon additively across all stages
 * (2500px+ for a 4-step roadmap). Stacking bounded-width mini-trees, joined
 * by a simple connector, keeps the whole thing scannable without horizontal
 * scrolling while still branching visually at every step.
 */
export function RoadmapDiagram({ steps }: { steps: RoadmapStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex w-full flex-col items-center">
          <div className="w-fit max-w-full overflow-x-auto py-1">
            <Tree
              label={<StageCard step={step} />}
              lineColor="var(--color-slate)"
              lineWidth="1.5px"
              lineBorderRadius="8px"
              nodePadding="6px"
              lineHeight="16px"
            >
              {step.actions.map((action) => (
                <TreeNode key={action.id} label={<ActionLeaf action={action} />} />
              ))}
            </Tree>
          </div>
          {index < steps.length - 1 && <span className="my-1 h-6 w-px bg-slate/30" aria-hidden />}
        </div>
      ))}
    </div>
  );
}
