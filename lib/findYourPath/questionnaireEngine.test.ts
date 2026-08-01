import { describe, expect, it } from "vitest";
import { FIND_YOUR_PATH_QUESTIONS, scoreQuestionnaire } from "./questionnaireEngine";

function answerAll(optionIdForQuestion: (questionId: string) => string): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const question of FIND_YOUR_PATH_QUESTIONS) {
    answers[question.id] = optionIdForQuestion(question.id);
  }
  return answers;
}

describe("FIND_YOUR_PATH_QUESTIONS", () => {
  it("has between 5 and 8 questions, each with at least 2 options", () => {
    expect(FIND_YOUR_PATH_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    expect(FIND_YOUR_PATH_QUESTIONS.length).toBeLessThanOrEqual(8);
    for (const question of FIND_YOUR_PATH_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("scoreQuestionnaire", () => {
  it("recommends the role whose options were consistently picked", () => {
    const answers = answerAll((questionId) => {
      const question = FIND_YOUR_PATH_QUESTIONS.find((q) => q.id === questionId)!;
      const socOption = question.options.find((o) => (o.points.soc_analyst ?? 0) >= 2);
      return (socOption ?? question.options[0]).id;
    });

    const rec = scoreQuestionnaire(answers);
    expect(rec.role).toBe("soc_analyst");
    expect(rec.tooClose).toBe(false);
  });

  it("recommends VAPT when every answer favors the offensive-track option", () => {
    const answers = answerAll((questionId) => {
      const question = FIND_YOUR_PATH_QUESTIONS.find((q) => q.id === questionId)!;
      const vaptOption = question.options.find((o) => (o.points.vapt ?? 0) >= 2);
      return (vaptOption ?? question.options[0]).id;
    });

    const rec = scoreQuestionnaire(answers);
    expect(rec.role).toBe("vapt");
  });

  it("falls back to generalist when no answers are provided (all scores tie at zero)", () => {
    const rec = scoreQuestionnaire({});
    expect(rec.role).toBe("generalist");
    expect(rec.tooClose).toBe(true);
  });

  it("falls back to generalist when the top two tracks are within the tie margin", () => {
    // Answer half the questions favoring SOC and half favoring VAPT so neither leads clearly.
    const answers: Record<string, string> = {};
    FIND_YOUR_PATH_QUESTIONS.forEach((question, index) => {
      const favor = index % 2 === 0 ? "soc_analyst" : "vapt";
      const option = question.options.find((o) => (o.points[favor] ?? 0) >= 1) ?? question.options[0];
      answers[question.id] = option.id;
    });

    const rec = scoreQuestionnaire(answers);
    expect(rec.tooClose).toBe(true);
    expect(rec.role).toBe("generalist");
  });

  it("ignores an answer that references a question/option id that doesn't exist", () => {
    const rec = scoreQuestionnaire({ "not-a-real-question": "not-a-real-option" });
    expect(rec.role).toBe("generalist");
  });
});
