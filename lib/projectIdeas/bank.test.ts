import { describe, expect, it } from "vitest";
import { ROLE_ORDER } from "@/lib/roles";
import { projectIdeaBank, projectIdeasForCategories } from "./bank";

const ALLOWED_EXTERNAL_HOSTS = ["https://www.sarathg.me/osint.html", "https://www.sarathg.me/shopeasy.html", "https://www.sarathg.me/wazuh.html", "https://www.sarathg.me/pivoting.html"];

describe("projectIdeaBank", () => {
  it("every idea has a unique id, a non-empty title/description, and at least one category and role", () => {
    const ids = new Set<string>();
    for (const idea of projectIdeaBank) {
      expect(ids.has(idea.id)).toBe(false);
      ids.add(idea.id);
      expect(idea.title.length).toBeGreaterThan(0);
      expect(idea.description.length).toBeGreaterThan(0);
      expect(idea.categories.length).toBeGreaterThan(0);
      expect(idea.roles.length).toBeGreaterThan(0);
    }
  });

  it("every idea is tagged for generalist (broadest-view track, same convention as lib/mcq)", () => {
    for (const idea of projectIdeaBank) {
      expect(idea.roles).toContain("generalist");
    }
  });

  it("only links to pages this project already confirmed are publicly navigable on sarathg.me", () => {
    for (const idea of projectIdeaBank) {
      if (idea.externalLink) {
        expect(ALLOWED_EXTERNAL_HOSTS).toContain(idea.externalLink.url);
      }
    }
  });
});

describe("projectIdeasForCategories", () => {
  it("returns only ideas matching both the role and at least one requested category", () => {
    const results = projectIdeasForCategories(projectIdeaBank, ["networking"], "vapt", 5);
    for (const idea of results) {
      expect(idea.roles).toContain("vapt");
      expect(idea.categories).toContain("networking");
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it("respects the limit", () => {
    const results = projectIdeasForCategories(projectIdeaBank, ["tools"], "generalist", 1);
    expect(results.length).toBe(1);
  });

  it("returns an empty list for a category no idea covers (e.g. certifications)", () => {
    const results = projectIdeasForCategories(projectIdeaBank, ["certifications"], "generalist", 5);
    expect(results).toEqual([]);
  });

  it("every role gets at least one idea for at least one real roadmap stage category", () => {
    for (const role of ROLE_ORDER) {
      const results = projectIdeasForCategories(
        projectIdeaBank,
        ["concepts_frameworks", "log_analysis", "networking", "tools", "vulnerability_identification", "owasp_top10", "incident_response", "scripting_programming"],
        role,
        20
      );
      expect(results.length).toBeGreaterThan(0);
    }
  });
});
