import type { CategoryKey } from "@/lib/scoring";
import type { AssessmentCategoryKey } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";

/** The gap categories a resource can be tied to — CV-side or assessment-side (same union project ideas uses). */
export type GapCategory = CategoryKey | AssessmentCategoryKey;

export type ResourceType = "practice_platform" | "documentation" | "course" | "video" | "cheat_sheet" | "community";

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  categories: GapCategory[];
  /** Track(s) this resource is tagged relevant for; most include "generalist" (same convention as lib/mcq/lib/projectIdeas). */
  roles: RoleKey[];
  type: ResourceType;
}

export type ResourceBank = Resource[];
