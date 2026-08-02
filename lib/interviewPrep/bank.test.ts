import { describe, expect, it } from "vitest";
import { ROLE_ORDER } from "@/lib/roles";
import { ASSESSMENT_CATEGORY_ORDER } from "@/lib/assessment";
import { CATEGORY_ORDER } from "@/lib/scoring";
import { interviewPrepBank, interviewPrepForRole } from "./bank";

describe("interviewPrepForRole", () => {
  it("returns content for every role track, each with at least one technical question", () => {
    for (const role of ROLE_ORDER) {
      const content = interviewPrepForRole(role);
      expect(content.role).toBe(role);
      expect(content.formatNote.length).toBeGreaterThan(0);
      expect(content.technicalQuestions.length).toBeGreaterThan(0);
    }
  });

  it("gives each role its own distinct set of technical questions (no accidental cross-role duplication)", () => {
    const idsByRole = ROLE_ORDER.map((role) => interviewPrepForRole(role).technicalQuestions.map((q) => q.id));
    const soc = new Set(idsByRole[ROLE_ORDER.indexOf("soc_analyst")]);
    const vapt = new Set(idsByRole[ROLE_ORDER.indexOf("vapt")]);
    for (const id of soc) {
      expect(vapt.has(id)).toBe(false);
    }
  });
});

describe("interviewPrepBank", () => {
  it("has shared behavioral questions and a named behavioral framework", () => {
    expect(interviewPrepBank.behavioralQuestions.length).toBeGreaterThan(0);
    expect(interviewPrepBank.behavioralFramework.name.length).toBeGreaterThan(0);
    expect(interviewPrepBank.behavioralFramework.description.length).toBeGreaterThan(0);
  });

  it("has no duplicate question ids across the entire bank (technical + behavioral)", () => {
    const allIds = [
      ...interviewPrepBank.roles.flatMap((r) => r.technicalQuestions.map((q) => q.id)),
      ...interviewPrepBank.behavioralQuestions.map((q) => q.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("every question has non-empty question text and a non-empty explanation of what it's checking", () => {
    const allQuestions = [
      ...interviewPrepBank.roles.flatMap((r) => r.technicalQuestions),
      ...interviewPrepBank.behavioralQuestions,
    ];
    for (const q of allQuestions) {
      expect(q.question.trim().length).toBeGreaterThan(0);
      expect(q.whatTheyreChecking.trim().length).toBeGreaterThan(0);
    }
  });

  it("has a worked STAR example with all four non-empty parts", () => {
    const { workedExample } = interviewPrepBank.behavioralFramework;
    expect(workedExample.situation.trim().length).toBeGreaterThan(0);
    expect(workedExample.task.trim().length).toBeGreaterThan(0);
    expect(workedExample.action.trim().length).toBeGreaterThan(0);
    expect(workedExample.result.trim().length).toBeGreaterThan(0);
  });

  it("every technical question's testedIn points at a real Assessment or Quiz category", () => {
    const allTechnicalQuestions = interviewPrepBank.roles.flatMap((r) => r.technicalQuestions);
    for (const q of allTechnicalQuestions) {
      expect(q.testedIn).toBeDefined();
      if (!q.testedIn) continue;
      const validCategories: string[] = q.testedIn.tool === "assessment" ? ASSESSMENT_CATEGORY_ORDER : CATEGORY_ORDER;
      expect(validCategories).toContain(q.testedIn.category);
    }
  });

  it("every technical question has at least one strong-answer point", () => {
    const allTechnicalQuestions = interviewPrepBank.roles.flatMap((r) => r.technicalQuestions);
    for (const q of allTechnicalQuestions) {
      expect(q.strongAnswerCovers && q.strongAnswerCovers.length).toBeGreaterThan(0);
    }
  });
});
