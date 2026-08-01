import { describe, expect, it } from "vitest";
import type { RoleKey } from "@/lib/roles";
import { ROLE_ORDER } from "@/lib/roles";
import { scoreMcq } from "./engine";
import { mcqBank, questionsForRole, toMcqPrompts } from "./questions";
import type { McqAnswerSubmission } from "./types";

describe("scoreMcq", () => {
  it("awards 100% when every question is answered with its correct choice", () => {
    const submissions: McqAnswerSubmission[] = mcqBank.map((q) => ({
      questionId: q.id,
      choiceId: q.correctChoiceId,
    }));

    const result = scoreMcq(submissions, mcqBank);
    expect(result.overallScore).toBe(100);
    for (const category of Object.values(result.categories)) {
      expect(category.score).toBe(100);
      expect(category.correctCount).toBe(category.total);
    }
  });

  it("scores 0 with no submissions and marks every question incorrect with a null submitted choice", () => {
    const result = scoreMcq([], mcqBank);
    expect(result.overallScore).toBe(0);
    for (const question of result.questions) {
      expect(question.correct).toBe(false);
      expect(question.submittedChoiceId).toBeNull();
    }
  });

  it("marks a wrong choice as incorrect without affecting other questions", () => {
    const submissions: McqAnswerSubmission[] = mcqBank.map((q) => ({
      questionId: q.id,
      choiceId: q.correctChoiceId,
    }));
    const wrongChoice = mcqBank[0].choices.find((c) => c.id !== mcqBank[0].correctChoiceId)!;
    submissions[0] = { questionId: mcqBank[0].id, choiceId: wrongChoice.id };

    const result = scoreMcq(submissions, mcqBank);
    expect(result.overallScore).toBeLessThan(100);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.questions[0].correct).toBe(false);
  });

  it("every actionable CV category has at least one question in the bank", () => {
    const result = scoreMcq([], mcqBank);
    for (const category of Object.values(result.categories)) {
      expect(category.total).toBeGreaterThan(0);
    }
  });

  it("education is not a valid MCQ category", () => {
    const result = scoreMcq([], mcqBank);
    expect(Object.keys(result.categories)).not.toContain("education");
  });
});

describe("toMcqPrompts", () => {
  it("never includes correctChoiceId or explanation in the client-facing shape", () => {
    const prompts = toMcqPrompts(mcqBank);
    const serialized = JSON.stringify(prompts);

    expect(serialized).not.toContain("correctChoiceId");
    expect(serialized).not.toContain("explanation");
    for (const prompt of prompts) {
      expect(prompt).not.toHaveProperty("correctChoiceId");
      expect(prompt).not.toHaveProperty("explanation");
    }
  });

  it("preserves every question and its choices", () => {
    const prompts = toMcqPrompts(mcqBank);
    expect(prompts.length).toBe(mcqBank.length);
    for (let i = 0; i < mcqBank.length; i++) {
      expect(prompts[i].choices.length).toBe(mcqBank[i].choices.length);
    }
  });
});

describe("questionsForRole", () => {
  it("generalist sees every question in the bank (broadest-view track)", () => {
    expect(questionsForRole(mcqBank, "generalist").length).toBe(mcqBank.length);
  });

  it("every non-generalist role sees at least one question per category, but not necessarily every question", () => {
    for (const role of ROLE_ORDER.filter((r): r is Exclude<RoleKey, "generalist"> => r !== "generalist")) {
      const filtered = questionsForRole(mcqBank, role);
      expect(filtered.length).toBeLessThanOrEqual(mcqBank.length);
      expect(filtered.length).toBeGreaterThan(0);

      const categoriesSeen = new Set(filtered.map((q) => q.category));
      const allCategories = new Set(mcqBank.map((q) => q.category));
      expect(categoriesSeen).toEqual(allCategories);
    }
  });

  it("only returns questions explicitly tagged with the requested role", () => {
    const netSecQuestions = questionsForRole(mcqBank, "network_security_engineer");
    for (const question of netSecQuestions) {
      expect(question.roles).toContain("network_security_engineer");
    }
  });
});
