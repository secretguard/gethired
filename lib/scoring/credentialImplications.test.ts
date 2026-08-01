import { describe, expect, it } from "vitest";
import { scoreCv } from "./engine";
import { corpus } from "./corpus";

function findMatched(result: ReturnType<typeof scoreCv>, label: string) {
  return result.matched.find((item) => item.label === label);
}

describe("credential-implies-skill mapping", () => {
  it("marks a concept as matched via an implying certification even when its literal keyword never appears", () => {
    const result = scoreCv("Holds a CCNA certification.", corpus, "generalist");
    const implied = findMatched(result, "TCP/IP & core networking");
    expect(implied).toBeDefined();
    expect(implied?.impliedBy).toEqual(["CCNA"]);
    // The literal keyword genuinely never appears in the CV text above.
    expect(result.matched.some((item) => item.label === "CCNA")).toBe(true);
  });

  it("does not mark an item impliedBy when it was already matched directly from the CV text", () => {
    const result = scoreCv("Holds a CCNA certification. Strong TCP/IP fundamentals.", corpus, "generalist");
    const item = findMatched(result, "TCP/IP & core networking");
    expect(item).toBeDefined();
    expect(item?.impliedBy).toBeUndefined();
  });

  it("credits multiple certifications when more than one implies the same item", () => {
    const result = scoreCv("Holds CEH and eJPT certifications.", corpus, "generalist");
    const nmap = findMatched(result, "Nmap");
    expect(nmap).toBeDefined();
    expect(nmap?.impliedBy).toContain("Certified Ethical Hacker (CEH)");
    expect(nmap?.impliedBy).toContain("eJPT");
  });

  it("raises the affected category's score when implications add matched weight", () => {
    const withoutCert = scoreCv("Some unrelated CV text with no certifications mentioned.", corpus, "generalist");
    const withCert = scoreCv(
      "Some unrelated CV text with no certifications mentioned, except holds a CompTIA Security+ certification.",
      corpus,
      "generalist"
    );
    expect(withCert.categories.concepts_frameworks.score).toBeGreaterThan(
      withoutCert.categories.concepts_frameworks.score
    );
  });

  it("does not apply an implication for a certification that was not matched", () => {
    const result = scoreCv("No certifications mentioned at all, just some general text.", corpus, "generalist");
    const tcpIp = result.categories.concepts_frameworks.missing.find(
      (item) => item.label === "TCP/IP & core networking"
    );
    expect(tcpIp).toBeDefined();
  });
});
