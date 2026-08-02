import resourcesJson from "@/data/resources.json";
import { CATEGORY_LABELS } from "@/lib/scoring";
import { ASSESSMENT_CATEGORY_LABELS } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";
import type { GapCategory, Resource, ResourceBank } from "./types";

export const resourceBank: ResourceBank = resourcesJson.resources as ResourceBank;

/** Display labels for both CV-side and assessment-side gap categories, since a resource can be tagged with either. */
export const GAP_CATEGORY_LABELS: Record<GapCategory, string> = {
  ...CATEGORY_LABELS,
  ...ASSESSMENT_CATEGORY_LABELS,
};

/** Every resource tagged relevant to this role — same role-gating convention as lib/mcq's questionsForRole. */
export function resourcesForRole(role: RoleKey): Resource[] {
  return resourceBank.filter((resource) => resource.roles.includes(role));
}

/**
 * Resources relevant to this role, tied to any of the given gap categories.
 * Same shape as lib/projectIdeas' projectIdeasForCategories — used to surface
 * resources for someone's actual current gaps, not just a generic browse.
 */
export function resourcesForCategories(role: RoleKey, categories: GapCategory[]): Resource[] {
  return resourceBank.filter(
    (resource) => resource.roles.includes(role) && resource.categories.some((c) => categories.includes(c))
  );
}

/** Distinct categories actually present in the bank for this role, in bank order — drives the filter chips. */
export function categoriesForRole(role: RoleKey): GapCategory[] {
  const seen = new Set<GapCategory>();
  const ordered: GapCategory[] = [];
  for (const resource of resourcesForRole(role)) {
    for (const category of resource.categories) {
      if (!seen.has(category)) {
        seen.add(category);
        ordered.push(category);
      }
    }
  }
  return ordered;
}
