import { describe, expect, it } from "vitest";
import { answerMatches, normalizeAnswer } from "./matcher";

describe("normalizeAnswer", () => {
  it("lowercases, trims, collapses whitespace, and strips trailing punctuation", () => {
    expect(normalizeAnswer("  SQL   Injection.  ")).toBe("sql injection");
    expect(normalizeAnswer("True Positive!")).toBe("true positive");
  });
});

describe("answerMatches", () => {
  it("matches an accepted answer case-insensitively", () => {
    expect(answerMatches("Sql Injection", ["sql injection", "injection"])).toBe(true);
  });

  it("matches a listed synonym, not just the primary answer", () => {
    expect(answerMatches("sqli", ["sql injection", "sqli", "injection"])).toBe(true);
  });

  it("matches despite trailing punctuation and extra whitespace", () => {
    expect(answerMatches("  true positive.  ", ["true positive", "tp"])).toBe(true);
  });

  it("rejects an answer not in the accepted list", () => {
    expect(answerMatches("false positive", ["true positive", "tp"])).toBe(false);
  });

  it("rejects an empty submission", () => {
    expect(answerMatches("   ", ["true positive"])).toBe(false);
  });
});
