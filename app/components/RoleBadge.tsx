"use client";

import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { ROLE_SHORT_LABELS } from "@/lib/roles";

/**
 * Read-only track indicator, replacing the old instant-switch dropdown —
 * under strict gating, changing tracks is a deliberate action (back to the
 * picker) rather than a silent live re-score.
 */
export function RoleBadge({ className = "" }: { className?: string }) {
  const { role, hasSelectedRole, resetSelection } = useRole();
  const router = useRouter();

  if (!hasSelectedRole) return null;

  function handleChangeTrack() {
    resetSelection();
    router.push("/");
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-slate/70">Track</span>
      <span className="rounded-full bg-beacon-soft px-2.5 py-1 text-sm font-medium text-ink">
        {ROLE_SHORT_LABELS[role]}
      </span>
      <button
        type="button"
        onClick={handleChangeTrack}
        className="text-xs font-medium text-beacon underline underline-offset-2 transition hover:text-beacon/80"
      >
        Change
      </button>
    </div>
  );
}
