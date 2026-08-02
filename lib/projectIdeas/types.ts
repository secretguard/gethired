import type { CategoryKey } from "@/lib/scoring";
import type { AssessmentCategoryKey } from "@/lib/assessment";
import type { RoleKey } from "@/lib/roles";

/** The gap categories a project idea can be tied to — CV-side or assessment-side. */
export type GapCategory = CategoryKey | AssessmentCategoryKey;

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  categories: GapCategory[];
  /** Track(s) this idea is tagged relevant for; every idea includes "generalist" (same convention as lib/mcq). */
  roles: RoleKey[];
  /** Only present when an existing labs.sarathg.me guide genuinely fits — never forced. */
  externalLink?: {
    label: string;
    url: string;
  };
}

export type ProjectIdeaBank = ProjectIdea[];
