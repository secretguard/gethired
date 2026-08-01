import type { RoleKey } from "@/lib/roles";
import { ASSESSMENT_CATEGORY_ORDER } from "./categories";
import type { AssessmentCategoryKey } from "./types";

/**
 * Categories that count toward a role's "readiness" headline score.
 * Mirrors the shared-core/role-specific scenario layering in
 * data/assessment-scenarios.json: readiness is measured against the
 * categories that track's role-specific scenarios cover, not every
 * category shown (shared-core scenarios build the baseline but aren't
 * what "SOC Analyst readiness" etc. is meant to certify).
 */
export const ASSESSMENT_ROLE_CORE_CATEGORIES: Record<RoleKey, AssessmentCategoryKey[]> = {
  soc_analyst: ["log_analysis", "incident_response"],
  vapt: ["vulnerability_identification", "owasp_top10"],
  network_security_engineer: ["networking"],
  generalist: ASSESSMENT_CATEGORY_ORDER,
};
