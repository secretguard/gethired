"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "../context/RoleContext";

/**
 * Gates a tool page (CV Screener/Assessment/Quiz/Roadmap) behind track
 * selection. Renders nothing for one tick while the role context hydrates
 * from localStorage, to avoid flashing the prompt at returning visitors who
 * already picked a track.
 */
export function RoleGate({ children }: { children: React.ReactNode }) {
  const { hasSelectedRole } = useRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferring to a client-only effect avoids flashing the gate prompt at
    // returning visitors before the role context finishes hydrating from
    // localStorage — see RoleContext.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with hydration timing, not deriving state from props
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!hasSelectedRole) {
    return (
      <main className="flex flex-1 flex-col items-center bg-fog px-4 py-14 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-slate/30 bg-paper p-8 text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate">Step 1 first</span>
          <h1 className="font-display text-2xl font-semibold text-ink">Pick your track</h1>
          <p className="text-sm text-slate">
            Every tool here runs against a specific role track&rsquo;s content, so pick one (or Generalist, or
            Find Your Path) before continuing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90"
            >
              Choose a track
            </Link>
            <Link
              href="/find-your-path"
              className="rounded-lg border border-slate/30 px-4 py-2 text-sm font-medium text-ink transition hover:bg-fog"
            >
              Find my path
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
