import { describe, expect, it } from "vitest";
import { ROLE_ORDER } from "@/lib/roles";
import { certPathForRole, generateRoadmap } from "./engine";
import { roadmapConfig } from "./config";
import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";

function rec(overrides: Partial<Recommendation>): Recommendation {
  return {
    id: "item",
    category: "tools",
    categoryLabel: "Tools",
    title: "Some tool",
    detail: "Get hands-on practice.",
    weight: 5,
    ...overrides,
  };
}

function emptyAssessmentCategories(): AssessmentResult["categories"] {
  const label = (l: string) => ({ label: l, score: 100, totalPoints: 10, earnedPoints: 10 });
  return {
    log_analysis: label("Log Analysis & SIEM"),
    networking: label("Networking & TCP/IP"),
    vulnerability_identification: label("Vulnerability Identification"),
    owasp_top10: label("OWASP Top 10 Recognition"),
    incident_response: label("Incident Response Triage"),
  };
}

const generalistReadiness: AssessmentResult["roleReadiness"] = {
  role: "generalist",
  label: "Generalist",
  score: 100,
  categories: ["log_analysis", "networking", "vulnerability_identification", "owasp_top10", "incident_response"],
};

describe("generateRoadmap", () => {
  it("returns an empty roadmap when there are no CV recommendations and no assessment", () => {
    expect(generateRoadmap([], null)).toEqual([]);
  });

  it("includes a stage when its mapped CV category has recommendations", () => {
    const roadmap = generateRoadmap([rec({ category: "tools" })], null);
    expect(roadmap.length).toBe(1);
    expect(roadmap[0].id).toBe("hands-on-practice");
    expect(roadmap[0].step).toBe(1);
    expect(roadmap[0].actions[0].source).toBe("cv");
  });

  it("includes a stage when its mapped assessment category scores below threshold, with missed checkpoints as actions", () => {
    const categories = emptyAssessmentCategories();
    categories.log_analysis = { label: "Log Analysis & SIEM", score: 30, totalPoints: 20, earnedPoints: 6 };
    const assessment: AssessmentResult = {
      overallScore: 50,
      categories,
      roleReadiness: generalistReadiness,
      scenarios: [
        {
          id: "scenario-1",
          title: "Suspicious Login",
          category: "log_analysis",
          checkpoints: [
            {
              id: "cp-1",
              question: "Q",
              correct: false,
              points: 10,
              pointsAwarded: 0,
              submittedAnswer: "wrong",
              explanation: "The explanation.",
            },
          ],
        },
      ],
    };

    const roadmap = generateRoadmap([], assessment);
    expect(roadmap.length).toBe(1);
    expect(roadmap[0].id).toBe("fundamentals");
    expect(roadmap[0].actions[0]).toMatchObject({ source: "assessment", detail: "The explanation." });
  });

  it("does not include a stage when its assessment categories all score above threshold", () => {
    const categories = emptyAssessmentCategories();
    const assessment: AssessmentResult = { overallScore: 100, categories, roleReadiness: generalistReadiness, scenarios: [] };
    expect(generateRoadmap([], assessment)).toEqual([]);
  });

  it("sequences included stages in the fixed stage order, not input order", () => {
    const roadmap = generateRoadmap(
      [rec({ category: "soft_skills", id: "soft-1" }), rec({ category: "certifications", id: "cert-1" })],
      null
    );
    expect(roadmap.map((s) => s.id)).toEqual(["certifications", "profile-polish"]);
    expect(roadmap[0].step).toBe(1);
    expect(roadmap[1].step).toBe(2);
  });

  it("combines CV and assessment actions for the same stage and caps at topActionsPerStage", () => {
    const categories = emptyAssessmentCategories();
    categories.networking = { label: "Networking & TCP/IP", score: 20, totalPoints: 10, earnedPoints: 2 };
    const assessment: AssessmentResult = {
      overallScore: 50,
      categories,
      roleReadiness: generalistReadiness,
      scenarios: [
        {
          id: "scenario-net",
          title: "Subnet Math",
          category: "networking",
          checkpoints: [
            { id: "cp-a", question: "Q1", correct: false, points: 10, pointsAwarded: 0, submittedAnswer: "", explanation: "e1" },
            { id: "cp-b", question: "Q2", correct: false, points: 10, pointsAwarded: 0, submittedAnswer: "", explanation: "e2" },
          ],
        },
      ],
    };
    const recommendations = [
      rec({ category: "concepts_frameworks", id: "cf-1" }),
      rec({ category: "concepts_frameworks", id: "cf-2" }),
      rec({ category: "concepts_frameworks", id: "cf-3" }),
    ];

    const roadmap = generateRoadmap(recommendations, assessment);
    expect(roadmap.length).toBe(1);
    expect(roadmap[0].id).toBe("fundamentals");
    // 3 CV recs + 2 assessment actions = 5 available, capped to topActionsPerStage (3).
    expect(roadmap[0].actions.length).toBe(3);
  });

  it("resolves each stage's intro to the selected role's own phrasing (V4-P4)", () => {
    const roadmapSoc = generateRoadmap([rec({ category: "tools" })], null, "soc_analyst");
    const roadmapVapt = generateRoadmap([rec({ category: "tools" })], null, "vapt");

    expect(roadmapSoc[0].intro).toBe(roadmapConfig.stages[1].intro.soc_analyst);
    expect(roadmapVapt[0].intro).toBe(roadmapConfig.stages[1].intro.vapt);
    expect(roadmapSoc[0].intro).not.toBe(roadmapVapt[0].intro);
  });

  it("defaults to generalist phrasing when no role is passed", () => {
    const roadmap = generateRoadmap([rec({ category: "tools" })], null);
    expect(roadmap[0].intro).toBe(roadmapConfig.stages[1].intro.generalist);
  });

  it("attaches role-relevant project ideas tied to the stage's own gap categories (V4-P5)", () => {
    const roadmap = generateRoadmap([rec({ category: "tools" })], null, "vapt");
    expect(roadmap[0].id).toBe("hands-on-practice");
    expect(roadmap[0].projects.length).toBeGreaterThan(0);
    expect(roadmap[0].projects.length).toBeLessThanOrEqual(roadmapConfig.topProjectsPerStage);
    const stageCategories: string[] = [...roadmapConfig.stages[1].cvCategories, ...roadmapConfig.stages[1].assessmentCategories];
    for (const project of roadmap[0].projects) {
      expect(project.roles).toContain("vapt");
      expect(project.categories.some((c) => stageCategories.includes(c))).toBe(true);
    }
  });

  it("shows no project ideas for a stage whose categories have none (certifications)", () => {
    const roadmap = generateRoadmap([rec({ category: "certifications", id: "cert-1" })], null);
    expect(roadmap[0].id).toBe("certifications");
    expect(roadmap[0].projects).toEqual([]);
  });
});

describe("certPathForRole", () => {
  it("returns a non-empty, distinct cert path for every role", () => {
    const paths = ROLE_ORDER.map((role) => certPathForRole(role));
    for (const path of paths) {
      expect(path.length).toBeGreaterThan(0);
    }
    // Every role's path should differ from at least one other role's — otherwise gating adds nothing.
    const serialized = paths.map((p) => p.join("|"));
    expect(new Set(serialized).size).toBeGreaterThan(1);
  });

  it("defaults to the generalist path when no role is passed", () => {
    expect(certPathForRole()).toEqual(roadmapConfig.certPaths.generalist);
  });
});
