import projectIdeasJson from "@/data/project-ideas.json";
import type { RoleKey } from "@/lib/roles";
import type { GapCategory, ProjectIdea, ProjectIdeaBank } from "./types";

export const projectIdeaBank: ProjectIdeaBank = projectIdeasJson.projects as ProjectIdeaBank;

/**
 * Ideas relevant to this role, tied to any of the given gap categories.
 * Same role-gating convention as lib/mcq's questionsForRole: every idea is
 * tagged with every role it's genuinely relevant for (generalist always
 * included), rather than a separate "if generalist, show everything" branch.
 */
export function projectIdeasForCategories(
  bank: ProjectIdeaBank,
  categories: GapCategory[],
  role: RoleKey,
  limit: number
): ProjectIdea[] {
  return bank
    .filter((idea) => idea.roles.includes(role) && idea.categories.some((c) => categories.includes(c)))
    .slice(0, limit);
}
