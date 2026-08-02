import type { RoadmapStep } from "@/lib/roadmap";

/**
 * Flattened across every currently-shown stage rather than embedded in the
 * (width-sensitive) org-chart diagram nodes — keeps this visible regardless
 * of whether the person has the Diagram or List view toggled, and each idea
 * only appears here because its category matched a real, current gap.
 */
export function ProjectIdeasPanel({ steps }: { steps: RoadmapStep[] }) {
  const items = steps.flatMap((step) => step.projects.map((project) => ({ project, stageTitle: step.title })));
  if (items.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-slate/15 bg-fog p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
        Project ideas for your gaps
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {items.map(({ project, stageTitle }) => (
          <div key={project.id} className="rounded-lg border border-slate/15 bg-paper p-3">
            <span className="rounded-full bg-slate/10 px-2 py-0.5 text-[11px] font-medium text-slate">
              For: {stageTitle}
            </span>
            <p className="mt-1.5 text-sm font-semibold text-ink">{project.title}</p>
            <p className="mt-1 text-sm text-slate">{project.description}</p>
            {project.externalLink && (
              <a
                href={project.externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-verified hover:underline"
              >
                {project.externalLink.label} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
