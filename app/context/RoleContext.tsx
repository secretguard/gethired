"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { RoleKey } from "@/lib/roles";
import { DEFAULT_ROLE, isRoleKey } from "@/lib/roles";

const ROLE_KEY = "gethired_role";
const CONFIRMED_KEY = "gethired_role_confirmed";

interface RoleContextValue {
  role: RoleKey;
  /** True once the person has explicitly chosen a track (or Generalist, or a Find Your Path recommendation). Gates CV Screener/Assessment/Quiz/Roadmap. */
  hasSelectedRole: boolean;
  /** Explicitly select/confirm a track — the only way `hasSelectedRole` becomes true. */
  selectRole: (role: RoleKey) => void;
  /** "Change track": un-gates back to the picker without forgetting the last pick (shown pre-highlighted). */
  resetSelection: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleKey>(DEFAULT_ROLE);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  useEffect(() => {
    // Reading localStorage must be deferred to a client-only effect — this
    // component is statically prerendered, and `window` doesn't exist there.
    const storedRole = window.localStorage.getItem(ROLE_KEY);
    const storedConfirmed = window.localStorage.getItem(CONFIRMED_KEY);

    if (isRoleKey(storedRole)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the external localStorage system on mount, not deriving state from props
      setRoleState(storedRole);
      if (storedConfirmed === "0") {
        setHasSelectedRole(false);
      } else {
        // A stored role with no explicit "0" is either a real prior
        // confirmation, or (backward compat) a track picked before this
        // gating flag existed — either way, someone already engaged with
        // track selection, so don't force them through it again.
        setHasSelectedRole(true);
        if (storedConfirmed !== "1") window.localStorage.setItem(CONFIRMED_KEY, "1");
      }
    }
  }, []);

  function selectRole(next: RoleKey) {
    setRoleState(next);
    setHasSelectedRole(true);
    window.localStorage.setItem(ROLE_KEY, next);
    window.localStorage.setItem(CONFIRMED_KEY, "1");
  }

  function resetSelection() {
    setHasSelectedRole(false);
    window.localStorage.setItem(CONFIRMED_KEY, "0");
  }

  return (
    <RoleContext.Provider value={{ role, hasSelectedRole, selectRole, resetSelection }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
