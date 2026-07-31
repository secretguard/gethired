import { describe, expect, it } from "vitest";
import { scoreCv } from "./engine";
import { corpus } from "./corpus";

function isMatched(result: ReturnType<typeof scoreCv>, label: string): boolean {
  return result.matched.some((item) => item.label === label);
}

describe("scoreCv real-world formatting variants", () => {
  it("matches a plural phrasing of a singular corpus term", () => {
    const result = scoreCv("Led several vulnerability assessments across client networks.", corpus);
    expect(isMatched(result, "Vulnerability assessment")).toBe(true);
  });

  it("matches the official ISO/IEC long form against the corpus's short ISO term", () => {
    const result = scoreCv("Familiar with ISO/IEC 27001 controls.", corpus);
    expect(isMatched(result, "ISO 27001 (awareness level)")).toBe(true);
  });

  it("matches 24/7 shift notation against the corpus's 24x7 term", () => {
    const result = scoreCv("Comfortable with 24/7 rotational shifts.", corpus);
    expect(isMatched(result, "Willingness to work shifts / 24x7 rotational")).toBe(true);
  });

  it("does not false-positive short tool acronyms against unrelated everyday words", () => {
    const result = scoreCv(
      "Volunteered at the school, helped kids with reading during weekend raids on the book sale.",
      corpus,
    );
    expect(isMatched(result, "Firewall / IDS / IPS platforms")).toBe(false);
  });

  it("still requires an actual skill mention — an empty CV matches nothing", () => {
    const result = scoreCv("", corpus);
    expect(result.matched.length).toBe(0);
    expect(result.overallScore).toBe(0);
  });
});
