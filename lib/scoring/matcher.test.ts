import { describe, expect, it } from "vitest";
import { normalizeText, textContainsTerm } from "./matcher";

describe("textContainsTerm", () => {
  it("matches an exact term", () => {
    const text = normalizeText("Experienced with Vulnerability assessment work.");
    expect(textContainsTerm(text, "Vulnerability assessment")).toBe(true);
  });

  it("matches a simple plural of a singular corpus term", () => {
    const text = normalizeText("Performed several vulnerability assessments last year.");
    expect(textContainsTerm(text, "Vulnerability assessment")).toBe(true);
  });

  it("matches a simple plural ending in -es", () => {
    const text = normalizeText("Ran vulnerability assessmentes just to check the suffix branch.");
    expect(textContainsTerm(text, "Vulnerability assessment")).toBe(true);
  });

  it("does not match when the term is embedded inside a longer word", () => {
    const text = normalizeText("Scheduled a reassessment of the network.");
    expect(textContainsTerm(text, "assessment")).toBe(false);
  });

  it("matches punctuation variants of a dotted term (B.Tech)", () => {
    expect(textContainsTerm(normalizeText("Holds a B.Tech degree"), "B.Tech")).toBe(true);
    expect(textContainsTerm(normalizeText("Holds a B Tech degree"), "B.Tech")).toBe(true);
    expect(textContainsTerm(normalizeText("Holds a BTech degree"), "B.Tech")).toBe(true);
    expect(textContainsTerm(normalizeText("Holds a B-Tech degree"), "B.Tech")).toBe(true);
  });

  it("matches hyphen/slash separated variants of a spaced term (ISO 27001)", () => {
    expect(textContainsTerm(normalizeText("Exposure to ISO 27001"), "ISO 27001")).toBe(true);
    expect(textContainsTerm(normalizeText("Exposure to ISO-27001"), "ISO 27001")).toBe(true);
    expect(textContainsTerm(normalizeText("Exposure to ISO27001"), "ISO 27001")).toBe(true);
  });

  it("does not false-positive on short ambiguous acronyms inside unrelated words", () => {
    const text = normalizeText("Looked after the kids during raids on the property.");
    expect(textContainsTerm(text, "IDS")).toBe(false);
    expect(textContainsTerm(text, "IPS")).toBe(false);
  });

  it("still requires a real word boundary before the optional plural suffix", () => {
    // "IDS" + optional "s"/"es" must not accidentally swallow into "IDSing" etc.
    const text = normalizeText("Worked with IDSing tools.");
    expect(textContainsTerm(text, "IDS")).toBe(false);
  });
});
