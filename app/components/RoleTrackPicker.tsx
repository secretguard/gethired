"use client";

import Link from "next/link";
import { useRole } from "../context/RoleContext";
import { ROLES, type RoleKey } from "@/lib/roles";

export function RoleTrackPicker({
  onSelect,
  showFindYourPath = true,
}: { onSelect?: (role: RoleKey) => void; showFindYourPath?: boolean } = {}) {
  const { role, selectRole } = useRole();

  function handleSelect(next: RoleKey) {
    selectRole(next);
    onSelect?.(next);
  }

  return (
    <div className="w-full max-w-4xl">
      <p className="mb-3 text-center font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
        Step 1 — pick your track
      </p>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${showFindYourPath ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        {ROLES.map((r) => {
          const active = r.key === role;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleSelect(r.key)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-1 rounded-2xl bg-paper p-4 text-left transition-all duration-150 ease-standard active:scale-[0.98] ${
                active ? "shadow-[0_0_0_2px_var(--color-beacon)] bg-beacon-soft" : "shadow-border hover:shadow-card-hover"
              }`}
            >
              <span className="font-display text-sm font-semibold text-ink">{r.shortLabel}</span>
              <span className="text-xs text-slate">{r.description}</span>
            </button>
          );
        })}
        {showFindYourPath && (
          <Link
            href="/find-your-path"
            className="flex flex-col items-start gap-1 rounded-2xl border-2 border-dashed border-slate/30 bg-paper p-4 text-left transition-all duration-150 ease-standard hover:border-beacon hover:shadow-card-hover active:scale-[0.98]"
          >
            <span className="font-display text-sm font-semibold text-beacon">Not sure?</span>
            <span className="text-xs text-slate">Find your path — score a CV or answer a few questions to get a recommendation.</span>
          </Link>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-slate/70">
        This gates what you see next — the CV Screener, Assessment, Quiz, and Roadmap will all run only your
        selected track&rsquo;s content. Just pick Generalist if none of these feel like a fit yet — you can change
        tracks anytime from the header.
      </p>
    </div>
  );
}
