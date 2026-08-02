"use client";

import { useMemo, useState } from "react";
import { useRole } from "../context/RoleContext";
import { resourcesForRole, categoriesForRole, GAP_CATEGORY_LABELS } from "@/lib/resources";
import type { GapCategory, ResourceType } from "@/lib/resources";

const TYPE_LABELS: Record<ResourceType, string> = {
  practice_platform: "Practice platform",
  documentation: "Documentation",
  course: "Course",
  video: "Video",
  cheat_sheet: "Cheat sheet",
  community: "Community",
};

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-standard active:scale-[0.96] ${
        active
          ? "bg-beacon-soft text-ink shadow-[0_0_0_1.5px_var(--color-beacon)]"
          : "bg-paper text-slate shadow-border hover:text-ink hover:shadow-card-hover"
      }`}
    >
      {children}
    </button>
  );
}

export function ResourceLibraryView() {
  const { role } = useRole();
  const [selected, setSelected] = useState<GapCategory | "all">("all");

  const allForRole = useMemo(() => resourcesForRole(role), [role]);
  const categories = useMemo(() => categoriesForRole(role), [role]);
  const visible = selected === "all" ? allForRole : allForRole.filter((r) => r.categories.includes(selected));

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <FilterChip active={selected === "all"} onClick={() => setSelected("all")}>
          All ({allForRole.length})
        </FilterChip>
        {categories.map((category) => {
          const count = allForRole.filter((r) => r.categories.includes(category)).length;
          return (
            <FilterChip key={category} active={selected === category} onClick={() => setSelected(category)}>
              {GAP_CATEGORY_LABELS[category]} ({count})
            </FilterChip>
          );
        })}
      </div>

      <div key={selected} className="animate-fade-up grid gap-3 sm:grid-cols-2">
        {visible.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 rounded-xl bg-paper p-4 shadow-border transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:scale-[0.99]"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-fog px-2 py-0.5 text-[11px] font-medium text-slate">
                {TYPE_LABELS[resource.type]}
              </span>
              {resource.categories.map((c) => (
                <span key={c} className="rounded-full bg-fog px-2 py-0.5 text-[11px] font-medium text-slate/70">
                  {GAP_CATEGORY_LABELS[c]}
                </span>
              ))}
            </div>
            <p className="font-display text-sm font-semibold text-ink">{resource.title}</p>
            <p className="text-sm text-slate">{resource.description}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-verified">
              Open resource
              <span className="transition-transform duration-150 ease-standard group-hover:translate-x-0.5">→</span>
            </span>
          </a>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="animate-fade-up text-center text-sm text-slate">No resources tagged for this category yet.</p>
      )}
    </div>
  );
}
