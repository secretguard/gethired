import type { RoadmapStep } from "@/lib/roadmap";
import { GAP_CATEGORY_LABELS } from "@/lib/resources";

const TYPE_LABELS: Record<string, string> = {
  practice_platform: "Practice platform",
  documentation: "Documentation",
  course: "Course",
  video: "Video",
  cheat_sheet: "Cheat sheet",
  community: "Community",
};

/**
 * Study-material companion to ProjectIdeasPanel's hands-on lab links —
 * reuses the Resource Library's own role+category matching (lib/resources)
 * rather than a second resource system, so the same guides/docs/courses
 * someone would find browsing /resources show up already matched to
 * their actual current gaps.
 */
export function RoadmapResourcesPanel({ steps }: { steps: RoadmapStep[] }) {
  const items = steps.flatMap((step) => step.resources.map((resource) => ({ resource, stageTitle: step.title })));
  if (items.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-fog p-4 shadow-border">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate/70">
        Resources for your gaps
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {items.map(({ resource, stageTitle }) => (
          <a
            key={`${resource.id}-${stageTitle}`}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 rounded-lg bg-paper p-3 shadow-border transition-all duration-150 ease-standard hover:shadow-card-hover"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-fog px-2 py-0.5 text-[11px] font-medium text-slate">
                For: {stageTitle}
              </span>
              <span className="rounded-full bg-fog px-2 py-0.5 text-[11px] font-medium text-slate/70">
                {TYPE_LABELS[resource.type] ?? resource.type}
              </span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-ink">{resource.title}</p>
            <p className="text-sm text-slate">{resource.description}</p>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-verified">
              {GAP_CATEGORY_LABELS[resource.categories[0]] ?? "Open resource"}
              <span className="transition-transform duration-150 ease-standard group-hover:translate-x-0.5">→</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
