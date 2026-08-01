"use client";

import { useRole } from "../context/RoleContext";
import { ROLES, type RoleKey } from "@/lib/roles";

export function RoleSelector({ className = "" }: { className?: string }) {
  const { role, setRole } = useRole();

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-slate/70">Track</span>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as RoleKey)}
        className="rounded-lg border border-slate/25 bg-paper px-2.5 py-1.5 text-sm font-medium text-ink focus:border-beacon focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r.key} value={r.key}>
            {r.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
