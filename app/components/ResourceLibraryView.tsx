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

export function ResourceLibraryView() {
  const { role } = useRole();
  const [selected, setSelected] = useState<GapCategory | "all">("all");

  const allForRole = useMemo(() => resourcesForRole(role), [role]);
  const categories = useMemo(() => categoriesForRole(role), [role]);
  const visible = selected === "all" ? allForRole : allForRole.filter((r) => r.categories.includes(selected));

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected("all")}
          aria-pressed={selected === "all"}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            selected === "all" ? "border-beacon bg-beacon-soft text-ink" : "border-slate/15 bg-paper text-slate hover:border-slate/30"
          }`}
        >
          All ({allForRole.length})
        </button>
        {categories.map((category) => {
          const count = allForRole.filter((r) => r.categories.includes(category)).length;
          const active = selected === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelected(category)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active ? "border-beacon bg-beacon-soft text-ink" : "border-slate/15 bg-paper text-slate hover:border-slate/30"
              }`}
            >
              {GAP_CATEGORY_LABELS[category]} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 rounded-xl border border-slate/15 bg-paper p-4 transition hover:border-slate/30"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-slate/10 px-2 py-0.5 text-[11px] font-medium text-slate">
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
            <span className="mt-auto text-sm font-medium text-verified">Open resource →</span>
          </a>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-center text-sm text-slate">No resources tagged for this category yet.</p>
      )}
    </div>
  );
}
