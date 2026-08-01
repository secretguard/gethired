import { describe, expect, it } from "vitest";
import { bestFitFromCvResults, type CvResultsByRoleForFit } from "./cvBestFit";
import { ROLE_ORDER, type RoleKey } from "@/lib/roles";
import { CATEGORY_ORDER, type CategoryKey, type CategoryResult, type ScoreResult } from "@/lib/scoring";

function emptyCategory(score: number): CategoryResult {
  return { label: "Test", score, matchedWeight: 0, totalWeight: 0, matched: [], missing: [] };
}

function fakeResult(role: RoleKey, overallScore: number, topCategory: CategoryKey = "tools"): ScoreResult {
  const categories = Object.fromEntries(
    CATEGORY_ORDER.map((key) => [key, emptyCategory(key === topCategory ? overallScore + 10 : overallScore)])
  ) as Record<CategoryKey, CategoryResult>;
  return { role, overallScore, categories, matched: [], missing: [] };
}

function resultsWithScores(scores: Partial<Record<RoleKey, number>>): CvResultsByRoleForFit {
  return Object.fromEntries(
    ROLE_ORDER.map((role) => [role, { result: fakeResult(role, scores[role] ?? 20) }])
  ) as CvResultsByRoleForFit;
}

describe("bestFitFromCvResults", () => {
  it("recommends the role with the clearly highest overall score", () => {
    const rec = bestFitFromCvResults(
      resultsWithScores({ soc_analyst: 20, vapt: 20, network_security_engineer: 65, generalist: 20 })
    );
    expect(rec.role).toBe("network_security_engineer");
    expect(rec.tooClose).toBe(false);
    expect(rec.why).toContain("Network Security Engineer");
  });

  it("falls back to generalist when the top two roles are within the tie margin", () => {
    const rec = bestFitFromCvResults(
      resultsWithScores({ soc_analyst: 40, vapt: 41, network_security_engineer: 20, generalist: 20 })
    );
    expect(rec.tooClose).toBe(true);
    expect(rec.role).toBe("generalist");
  });

  it("mentions the top-scoring category in the 'why' line when not falling back", () => {
    const results = resultsWithScores({ soc_analyst: 70, vapt: 10, network_security_engineer: 10, generalist: 10 });
    const rec = bestFitFromCvResults(results);
    expect(rec.role).toBe("soc_analyst");
    expect(rec.why).toContain("Tools");
  });
});
