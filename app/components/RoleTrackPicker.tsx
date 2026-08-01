"use client";

import { useRole } from "../context/RoleContext";
import { ROLES } from "@/lib/roles";

export function RoleTrackPicker() {
  const { role, setRole } = useRole();

  return (
    <div className="w-full max-w-3xl">
      <p className="mb-3 text-center font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">
        Step 1 — pick your track
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => {
          const active = r.key === role;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-beacon bg-beacon-soft"
                  : "border-slate/15 bg-paper hover:border-slate/30"
              }`}
            >
              <span className="font-display text-sm font-semibold text-ink">{r.shortLabel}</span>
              <span className="text-xs text-slate">{r.description}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-slate/70">
        Not sure? Generalist is a fine default — every tool below reuses this pick, and you can change it anytime
        from the Track menu at the top of the page.
      </p>
    </div>
  );
}
