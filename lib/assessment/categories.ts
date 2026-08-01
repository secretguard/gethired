import type { AssessmentCategoryKey } from "./types";

export const ASSESSMENT_CATEGORY_LABELS: Record<AssessmentCategoryKey, string> = {
  log_analysis: "Log Analysis & SIEM",
  networking: "Networking & TCP/IP",
  vulnerability_identification: "Vulnerability Identification",
  owasp_top10: "OWASP Top 10 Recognition",
  incident_response: "Incident Response Triage",
};

export const ASSESSMENT_CATEGORY_ORDER: AssessmentCategoryKey[] = [
  "log_analysis",
  "networking",
  "vulnerability_identification",
  "owasp_top10",
  "incident_response",
];
