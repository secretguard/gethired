import { describe, expect, it } from "vitest";
import type { RoleKey } from "@/lib/roles";
import { ROLE_ORDER } from "@/lib/roles";
import { scoreAssessment } from "./engine";
import { ASSESSMENT_ROLE_CORE_CATEGORIES } from "./roleConfig";
import { scenarioBank, scenariosForRole } from "./scenarios";
import { toScenarioPrompts } from "./scenarios";
import type { AnswerSubmission } from "./types";

describe("scoreAssessment", () => {
  it("awards full points for every checkpoint when all correct answers are submitted", () => {
    const submissions: AnswerSubmission[] = scenarioBank.flatMap((scenario) =>
      scenario.checkpoints.map((checkpoint) => ({
        checkpointId: checkpoint.id,
        answer: checkpoint.acceptedAnswers[0],
      })),
    );

    const result = scoreAssessment(submissions, scenarioBank);

    expect(result.overallScore).toBe(100);
    for (const category of Object.values(result.categories)) {
      expect(category.score).toBe(100);
      expect(category.earnedPoints).toBe(category.totalPoints);
    }
  });

  it("accepts a listed synonym, not just the first accepted answer", () => {
    const scenario = scenarioBank.find((s) => s.id === "vuln-id-1")!;
    const checkpoint = scenario.checkpoints.find((c) => c.id === "vuln-id-1-q1")!;
    const synonym = checkpoint.acceptedAnswers.find((a) => a !== checkpoint.acceptedAnswers[0])!;

    const result = scoreAssessment([{ checkpointId: checkpoint.id, answer: synonym }], scenarioBank);
    const checkpointResult = result.scenarios
      .find((s) => s.id === scenario.id)!
      .checkpoints.find((c) => c.id === checkpoint.id)!;

    expect(checkpointResult.correct).toBe(true);
  });

  it("scores 0 with no submissions and never crashes on a missing answer", () => {
    const result = scoreAssessment([], scenarioBank);
    expect(result.overallScore).toBe(0);
    for (const category of Object.values(result.categories)) {
      expect(category.score).toBe(0);
    }
  });

  it("scores an individual wrong answer as incorrect without affecting other checkpoints", () => {
    const submissions: AnswerSubmission[] = scenarioBank.flatMap((scenario) =>
      scenario.checkpoints.map((checkpoint) => ({
        checkpointId: checkpoint.id,
        answer: checkpoint.acceptedAnswers[0],
      })),
    );
    submissions[0] = { checkpointId: submissions[0].checkpointId, answer: "definitely wrong" };

    const result = scoreAssessment(submissions, scenarioBank);
    expect(result.overallScore).toBeLessThan(100);
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it("every category in the fixed category order has at least one scenario in the bank", () => {
    const result = scoreAssessment([], scenarioBank);
    for (const category of Object.values(result.categories)) {
      expect(category.totalPoints).toBeGreaterThan(0);
    }
  });
});

describe("toScenarioPrompts", () => {
  it("never includes the acceptedAnswers or explanation fields in the client-facing shape", () => {
    const prompts = toScenarioPrompts(scenarioBank);
    const serialized = JSON.stringify(prompts);

    expect(serialized).not.toContain("acceptedAnswers");
    expect(serialized).not.toContain("explanation");
    for (const scenario of prompts) {
      for (const checkpoint of scenario.checkpoints) {
        expect(checkpoint).not.toHaveProperty("acceptedAnswers");
        expect(checkpoint).not.toHaveProperty("explanation");
      }
    }
  });

  it("preserves every scenario and checkpoint", () => {
    const prompts = toScenarioPrompts(scenarioBank);
    expect(prompts.length).toBe(scenarioBank.length);
    for (let i = 0; i < scenarioBank.length; i++) {
      expect(prompts[i].checkpoints.length).toBe(scenarioBank[i].checkpoints.length);
    }
  });
});

describe("scenariosForRole", () => {
  it("generalist sees every scenario in the bank (broadest-view track)", () => {
    expect(scenariosForRole(scenarioBank, "generalist").length).toBe(scenarioBank.length);
  });

  it("every non-generalist role sees strictly fewer scenarios than generalist, but at least one per category", () => {
    for (const role of ROLE_ORDER.filter((r): r is Exclude<RoleKey, "generalist"> => r !== "generalist")) {
      const filtered = scenariosForRole(scenarioBank, role);
      expect(filtered.length).toBeLessThan(scenarioBank.length);
      expect(filtered.length).toBeGreaterThan(0);

      const categoriesSeen = new Set(filtered.map((s) => s.category));
      const allCategories = new Set(scenarioBank.map((s) => s.category));
      expect(categoriesSeen).toEqual(allCategories);
    }
  });

  it("only returns scenarios explicitly tagged with the requested role", () => {
    const socScenarios = scenariosForRole(scenarioBank, "soc_analyst");
    for (const scenario of socScenarios) {
      expect(scenario.roles).toContain("soc_analyst");
    }
  });
});

describe("roleReadiness", () => {
  it("scores 100 readiness when every checkpoint in the role's core categories is answered correctly", () => {
    for (const role of ROLE_ORDER) {
      const bank = scenariosForRole(scenarioBank, role);
      const submissions: AnswerSubmission[] = bank.flatMap((scenario) =>
        scenario.checkpoints.map((checkpoint) => ({
          checkpointId: checkpoint.id,
          answer: checkpoint.acceptedAnswers[0],
        }))
      );

      const result = scoreAssessment(submissions, bank, role);
      expect(result.roleReadiness.role).toBe(role);
      expect(result.roleReadiness.score).toBe(100);
      expect(result.roleReadiness.categories).toEqual(ASSESSMENT_ROLE_CORE_CATEGORIES[role]);
    }
  });

  it("readiness reflects only the role's core categories, not the overall score", () => {
    // soc_analyst's core categories are log_analysis + incident_response — getting every
    // *other* shown category wrong should not move readiness at all.
    const role: RoleKey = "soc_analyst";
    const bank = scenariosForRole(scenarioBank, role);
    const submissions: AnswerSubmission[] = bank.flatMap((scenario) =>
      scenario.checkpoints.map((checkpoint) => ({
        checkpointId: checkpoint.id,
        answer:
          scenario.category === "log_analysis" || scenario.category === "incident_response"
            ? checkpoint.acceptedAnswers[0]
            : "definitely wrong",
      }))
    );

    const result = scoreAssessment(submissions, bank, role);
    expect(result.roleReadiness.score).toBe(100);
    expect(result.overallScore).toBeLessThan(100);
  });

  it("defaults to generalist readiness when no role is passed", () => {
    const result = scoreAssessment([], scenarioBank);
    expect(result.roleReadiness.role).toBe("generalist");
  });
});
