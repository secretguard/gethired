"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { RoleKey } from "@/lib/roles";
import { DEFAULT_ROLE, isRoleKey } from "@/lib/roles";

const STORAGE_KEY = "gethired_role";

interface RoleContextValue {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleKey>(DEFAULT_ROLE);

  useEffect(() => {
    // Reading localStorage must be deferred to a client-only effect — this
    // component is statically prerendered, and `window` doesn't exist there.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the external localStorage system on mount, not deriving state from props
    if (isRoleKey(stored)) setRoleState(stored);
  }, []);

  function setRole(next: RoleKey) {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
