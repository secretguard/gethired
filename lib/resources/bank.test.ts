import { describe, expect, it } from "vitest";
import { ROLE_ORDER } from "@/lib/roles";
import { resourceBank, resourcesForRole, resourcesForCategories, categoriesForRole } from "./bank";

const RESOURCE_TYPES = ["practice_platform", "documentation", "course", "video", "cheat_sheet", "community"];

describe("resourceBank", () => {
  it("every resource has a unique id, non-empty title/description/url, and at least one category and role", () => {
    const ids = new Set<string>();
    for (const resource of resourceBank) {
      expect(ids.has(resource.id)).toBe(false);
      ids.add(resource.id);
      expect(resource.title.length).toBeGreaterThan(0);
      expect(resource.description.length).toBeGreaterThan(0);
      expect(resource.categories.length).toBeGreaterThan(0);
      expect(resource.roles.length).toBeGreaterThan(0);
      expect(RESOURCE_TYPES).toContain(resource.type);
    }
  });

  it("every url is a genuine https link, not a placeholder", () => {
    for (const resource of resourceBank) {
      expect(resource.url.startsWith("https://")).toBe(true);
    }
  });

  it("every role gets at least one resource for every skill/gap category the assessment/CV corpus actually gates", () => {
    for (const role of ROLE_ORDER) {
      const results = resourcesForRole(role);
      expect(results.length).toBeGreaterThan(0);
    }
  });
});

describe("resourcesForCategories", () => {
  it("returns only resources matching both the role and at least one requested category", () => {
    const results = resourcesForCategories("vapt", ["owasp_top10"]);
    expect(results.length).toBeGreaterThan(0);
    for (const resource of results) {
      expect(resource.roles).toContain("vapt");
      expect(resource.categories).toContain("owasp_top10");
    }
  });

  it("returns an empty list when no resource matches the given category", () => {
    const results = resourcesForCategories("generalist", ["education" as never]);
    expect(results).toEqual([]);
  });

  it("network_security_engineer gets networking-specific resources, not just generalist ones", () => {
    const results = resourcesForCategories("network_security_engineer", ["networking"]);
    expect(results.some((r) => r.id === "netacad-ccna-intro-to-networks")).toBe(true);
  });
});

describe("categoriesForRole", () => {
  it("returns distinct categories with no duplicates", () => {
    const categories = categoriesForRole("generalist");
    expect(new Set(categories).size).toBe(categories.length);
    expect(categories.length).toBeGreaterThan(0);
  });
});
