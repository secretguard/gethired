"use client";

// Lightweight, persists-across-visits self-tracking checklist for Interview
// Prep questions — localStorage (not sessionStorage) since, unlike the CV/
// assessment results cache, this is a preference someone would want
// remembered on a later visit, same convention as RoleContext's track choice.

import { useEffect, useState } from "react";

const REVIEWED_KEY = "gethired_interview_reviewed";

function readReviewed(): Set<string> {
  try {
    const raw = window.localStorage.getItem(REVIEWED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeReviewed(ids: Set<string>) {
  try {
    window.localStorage.setItem(REVIEWED_KEY, JSON.stringify([...ids]));
  } catch {
    // best-effort only — localStorage can be unavailable (private mode, quota)
  }
}

export function useReviewedQuestions() {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Deferred to a client-only effect — this reads localStorage, which
    // doesn't exist during server prerendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing with the external localStorage cache on mount, not deriving state from props
    setReviewed(readReviewed());
  }, []);

  function toggleReviewed(id: string) {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeReviewed(next);
      return next;
    });
  }

  return { reviewed, toggleReviewed };
}
