"use client";

// Ephemeral, browser-local cache so the standalone Roadmap page can combine
// CV and Assessment gaps even when someone reaches it directly (not through
// the sequential CV -> Assessment flow) without persisting CV text anywhere.
// Cleared automatically when the tab closes.

import type { RoleKey } from "@/lib/roles";
import type { ScoreResult } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";

const CV_KEY = "gethired_cv_results";
const ASSESSMENT_KEY = "gethired_assessment_result";

export type CvResultsByRole = Record<RoleKey, { result: ScoreResult; recommendations: Recommendation[] }>;

function readJson<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort only — sessionStorage can be unavailable (private mode, quota)
  }
}

export function saveCvResults(results: CvResultsByRole) {
  writeJson(CV_KEY, results);
}

export function getCvResults(): CvResultsByRole | null {
  return readJson<CvResultsByRole>(CV_KEY);
}

export function saveAssessmentResult(result: AssessmentResult) {
  writeJson(ASSESSMENT_KEY, result);
}

export function getAssessmentResult(): AssessmentResult | null {
  return readJson<AssessmentResult>(ASSESSMENT_KEY);
}
