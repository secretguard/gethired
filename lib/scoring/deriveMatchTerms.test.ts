import { describe, expect, it } from "vitest";
import { deriveMatchTerms } from "./deriveMatchTerms";

describe("deriveMatchTerms", () => {
  it("adds the ISO/IEC long form alongside the corpus's short ISO form", () => {
    const terms = deriveMatchTerms("ISO 27001 (awareness level)");
    expect(terms).toContain("ISO 27001");
    expect(terms).toContain("ISO/IEC 27001");
  });

  it("adds a slash-ratio variant alongside an x-ratio shift term", () => {
    const terms = deriveMatchTerms("Willingness to work shifts / 24x7 rotational");
    expect(terms).toContain("24x7 rotational");
    expect(terms).toContain("24/7 rotational");
    expect(terms).toContain("24/7");
    expect(terms).toContain("shifts");
  });

  it("leaves keywords with no ISO/ratio pattern unaffected", () => {
    const terms = deriveMatchTerms("Python");
    expect(terms).toEqual(["Python"]);
  });
});
