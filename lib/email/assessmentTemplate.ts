import type { AssessmentCategoryKey, AssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_CATEGORY_ORDER } from "@/lib/assessment";
import type { Recommendation } from "@/lib/recommendations";
import type { RoleKey } from "@/lib/roles";
import { certPathForRole, generateRoadmap } from "@/lib/roadmap";
import type { RoadmapStep } from "@/lib/roadmap";
import { INK, SLATE, SLATE_FAINT, FOG, PAPER, VERIFIED, BEACON, SITE_URL, scoreBarHtml } from "./template";

function categorySection(key: AssessmentCategoryKey, category: AssessmentResult["categories"][AssessmentCategoryKey], index: number): string {
  const code = `PA.${String(index + 1).padStart(2, "0")}`;
  return `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 2px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">${code}</p>
        <div style="display:flex;justify-content:space-between;font-weight:600;color:${INK};font-size:14px;margin-bottom:6px;">
          ${category.label} <span style="color:${SLATE};font-weight:500;">${category.score}%</span>
        </div>
        ${scoreBarHtml(category.score, category.score >= 70 ? VERIFIED : BEACON)}
        <p style="margin:6px 0 0;font-size:12px;color:${SLATE_FAINT};">${category.earnedPoints} / ${category.totalPoints} points</p>
      </td>
    </tr>`;
}

function roleReadinessSection(readiness: AssessmentResult["roleReadiness"]): string {
  return `
    <div style="margin:16px 0;padding:14px 16px;background:${FOG};border-radius:8px;">
      <div style="display:flex;justify-content:space-between;font-weight:600;color:${INK};font-size:14px;margin-bottom:6px;">
        ${readiness.label} readiness <span>${readiness.score}%</span>
      </div>
      ${scoreBarHtml(readiness.score, VERIFIED)}
    </div>`;
}

function roadmapStepSection(step: RoadmapStep): string {
  const actions = step.actions
    .map(
      (action) =>
        `<li style="margin-bottom:6px;"><span style="font-weight:600;color:${INK};">${action.label}</span><div style="color:${SLATE};font-size:13px;">${action.detail}</div></li>`
    )
    .join("");

  const resources = step.resources
    .slice(0, 3)
    .map(
      (resource) =>
        `<li style="margin-bottom:4px;"><a href="${resource.url}" style="color:${VERIFIED};font-weight:600;">${resource.title}</a> <span style="color:${SLATE_FAINT};font-size:12px;">— ${resource.description}</span></li>`
    )
    .join("");

  return `
    <div style="margin-bottom:16px;padding:14px 16px;background:${FOG};border-radius:8px;">
      <p style="margin:0 0 2px;color:${SLATE_FAINT};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Step ${step.step}</p>
      <p style="margin:0 0 6px;font-weight:600;color:${INK};font-size:15px;">${step.title}</p>
      <p style="margin:0 0 8px;color:${SLATE};font-size:13px;">${step.intro}</p>
      ${actions ? `<ul style="margin:0 0 8px;padding-left:18px;">${actions}</ul>` : ""}
      ${resources ? `<p style="margin:8px 0 4px;color:${SLATE_FAINT};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Resources</p><ul style="margin:0;padding-left:18px;">${resources}</ul>` : ""}
    </div>`;
}

function roadmapSection(steps: RoadmapStep[], role: RoleKey): string {
  const certPath = certPathForRole(role).join(" &rarr; ");

  if (steps.length === 0) {
    return `
      <h2 style="font-size:16px;color:${INK};margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">Your roadmap</h2>
      <p style="color:${SLATE};font-size:13px;">No major gaps across your assessment and CV results — you&rsquo;re already covering the fundamentals well.</p>
      <p style="margin-top:8px;color:${SLATE_FAINT};font-size:12px;">Typical certification path: ${certPath}</p>`;
  }

  return `
    <h2 style="font-size:16px;color:${INK};margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">Your roadmap</h2>
    <p style="color:${SLATE_FAINT};font-size:12px;margin:0 0 12px;">A sequenced next-steps plan combining your CV and assessment gaps.</p>
    ${steps.map(roadmapStepSection).join("")}
    <p style="color:${SLATE_FAINT};font-size:12px;">Typical certification path: ${certPath}</p>`;
}

export interface AssessmentReportEmailInput {
  result: AssessmentResult;
  role: RoleKey;
  recommendations: Recommendation[];
}

export function renderAssessmentReportEmail({
  result,
  role,
  recommendations,
}: AssessmentReportEmailInput): { subject: string; html: string } {
  const subject = `Your GetHired practical assessment — ${result.overallScore}% overall`;

  const sections = ASSESSMENT_CATEGORY_ORDER.map((key, index) => categorySection(key, result.categories[key], index)).join(
    ""
  );

  const steps = generateRoadmap(recommendations, result, role);

  const html = `
  <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:${FOG};">
    <div style="background:${PAPER};border-radius:12px;padding:24px;">
      <img src="${SITE_URL}/email_logo.png" alt="GetHired" width="200" height="50" style="display:block;width:200px;height:auto;margin:0 0 16px;border:0;" />
      <p style="margin:0 0 8px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.15em;">Rule-based scenarios — no AI grading</p>
      <h1 style="font-size:20px;color:${INK};margin:0 0 4px;">Your Practical Assessment results</h1>
      <p style="color:${SLATE};font-size:14px;margin:0 0 20px;">
        Static, checkpoint-style scenarios covering log analysis, networking, vulnerability identification, OWASP
        Top 10 recognition, and incident-response triage — scored with exact-match rules, no AI grading.
      </p>

      <div style="text-align:center;padding:20px 0 8px;border-bottom:1px solid #e5e7eb;margin-bottom:8px;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;color:${INK};">${result.overallScore}</div>
        <div style="color:${SLATE};font-size:13px;">Overall assessment score</div>
      </div>

      ${roleReadinessSection(result.roleReadiness)}

      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${sections}
      </table>

      ${roadmapSection(steps, role)}

      <p style="color:${SLATE_FAINT};font-size:12px;margin-top:24px;">
        This result was generated automatically by GetHired's rule-based assessment engine — no AI involved.
      </p>
    </div>
  </div>`;

  return { subject, html };
}
