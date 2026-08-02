import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";
import { OVERALL_SCORE_CATEGORIES } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import { DISPLAY_RECOMMENDATION_LIMIT } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_CATEGORY_ORDER } from "@/lib/assessment";

// Palette mirrors the app's design tokens (app/globals.css) — kept as literal
// hex here rather than shared constants because email HTML can't reference
// CSS custom properties, and most mail clients ignore web fonts, so this
// intentionally falls back to a system sans stack instead of the app's
// Space Grotesk/IBM Plex pairing.
// Exported so the Quiz/Assessment result emails (lib/email/quizTemplate.ts,
// lib/email/assessmentTemplate.ts) share exactly this palette and the logo
// URL resolution instead of redefining a second copy of it.
export const INK = "#12181f";
export const SLATE = "#4b5568";
export const SLATE_FAINT = "#8891a0";
export const FOG = "#f3f5f7";
export const PAPER = "#ffffff";
export const BEACON = "#ff403d";
export const VERIFIED = "#147a65";
export const VERIFIED_SOFT = "#e4f3ef";
export const SLATE_SOFT = "#eef0f3";

// Email clients can't resolve relative paths (there's no "current origin" in
// an inbox), so the logo needs a real, publicly-reachable absolute URL —
// unlike every other image reference in this codebase, which are all normal
// same-origin web pages. Overridable via NEXT_PUBLIC_SITE_URL for preview/
// staging environments; defaults to the deployed production domain.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gethired.sarathg.me";

/** Thin inline progress bar shared by the Quiz/Assessment result emails — same visual shape as the app's CoverageBar component, reimplemented with table-safe inline styles since email HTML can't use a React component. */
export function scoreBarHtml(score: number, color: string = BEACON): string {
  return `<div style="height:6px;border-radius:999px;background:${FOG};overflow:hidden;"><div style="height:100%;width:${score}%;border-radius:999px;background:${color};"></div></div>`;
}

export function chipList(items: MatchedItem[], background: string, color: string): string {
  if (items.length === 0) {
    return `<span style="color:${SLATE_FAINT};font-size:13px;">None</span>`;
  }
  return items
    .map((item) => {
      const impliedTag = item.impliedBy
        ? `<span style="font-weight:400;opacity:0.75;"> · via ${item.impliedBy[0]}</span>`
        : "";
      return `<span style="display:inline-block;background:${background};color:${color};border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${item.label}${impliedTag}</span>`;
    })
    .join("");
}

function strengthsSection(categories: Record<CategoryKey, CategoryResult>): string {
  const allMatched = OVERALL_SCORE_CATEGORIES.flatMap((key) => categories[key].matched).sort(
    (a, b) => b.weight - a.weight
  );

  return `
    <h2 style="font-size:16px;color:${INK};margin:0 0 4px;">Section 1 — What's good</h2>
    <p style="margin:0 0 10px;color:${SLATE_FAINT};font-size:12px;">Matched strengths (${allMatched.length})</p>
    <div style="margin-bottom:8px;">${chipList(allMatched, VERIFIED_SOFT, VERIFIED)}</div>`;
}

function categorySection(result: CategoryResult, index: number): string {
  const code = `CH.${String(index + 1).padStart(2, "0")}`;
  return `
    <tr>
      <td style="padding:16px 0;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 2px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">${code}</p>
        <div style="display:flex;justify-content:space-between;font-weight:600;color:${INK};font-size:15px;margin-bottom:8px;">
          ${result.label} <span style="color:${SLATE};font-weight:500;">${result.score}% match</span>
        </div>
        <p style="margin:0 0 4px;color:${SLATE_FAINT};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Worth adding</p>
        <div>${chipList(result.missing, SLATE_SOFT, SLATE)}</div>
      </td>
    </tr>`;
}

function educationSection(result: CategoryResult): string {
  if (result.matched.length === 0) {
    return `
      <div style="margin-top:16px;padding:12px 16px;background:${FOG};border-radius:8px;">
        <p style="margin:0;font-weight:600;color:${INK};font-size:14px;">${result.label}</p>
        <p style="margin:4px 0 0;color:${SLATE};font-size:13px;">
          No specific education background detected on your CV — that's fine, it isn't scored as a requirement
          and doesn't affect your overall match.
        </p>
      </div>`;
  }

  return `
    <div style="margin-top:16px;padding:12px 16px;background:${FOG};border-radius:8px;">
      <p style="margin:0 0 6px;">
        <span style="font-weight:600;color:${INK};font-size:14px;">${result.label}</span>
        <span style="color:${SLATE_FAINT};font-size:12px;"> (informational — not scored)</span>
      </p>
      <p style="margin:0 0 8px;color:${SLATE_FAINT};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Detected on your CV</p>
      <div>${chipList(result.matched, VERIFIED_SOFT, VERIFIED)}</div>
    </div>`;
}

function recommendationsSection(recommendations: Recommendation[]): string {
  if (recommendations.length === 0) {
    return `<p style="color:${SLATE};font-size:13px;">No major gaps found — your CV already covers the categories we check well.</p>`;
  }

  const items = recommendations
    .slice(0, DISPLAY_RECOMMENDATION_LIMIT)
    .map(
      (rec, index) => `
        <li style="margin-bottom:10px;">
          <span style="font-weight:600;color:${INK};">${index + 1}. ${rec.title}</span>
          <span style="color:${SLATE_FAINT};font-size:12px;"> (${rec.categoryLabel})</span>
          <div style="color:${SLATE};font-size:13px;">${rec.detail}</div>
        </li>`
    )
    .join("");

  return `<ol style="padding-left:20px;margin:0;list-style:none;">${items}</ol>`;
}

function assessmentSection(assessment: AssessmentResult | null): string {
  if (!assessment) {
    return `
      <div style="margin-top:20px;border:1px dashed #c7cdd6;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;color:${SLATE};font-size:13px;font-weight:600;">Practical assessment: not yet taken</p>
        <p style="margin:4px 0 0;color:${SLATE_FAINT};font-size:12px;">
          Take the checkpoint-based practical assessment on your report page to add real skills-check results
          here alongside your CV score.
        </p>
      </div>`;
  }

  const rows = ASSESSMENT_CATEGORY_ORDER.map((key, index) => {
    const category = assessment.categories[key];
    const code = `PA.${String(index + 1).padStart(2, "0")}`;
    return `
      <tr>
        <td style="padding:12px 0;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 2px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">${code}</p>
          <div style="display:flex;justify-content:space-between;font-weight:600;color:${INK};font-size:14px;">
            ${category.label} <span style="color:${SLATE};font-weight:500;">${category.score}%</span>
          </div>
        </td>
      </tr>`;
  }).join("");

  return `
    <h2 style="font-size:16px;color:${INK};margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">
      Practical assessment — ${assessment.overallScore}% overall
    </h2>
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      ${rows}
    </table>`;
}

export interface ReportEmailInput {
  overallScore: number;
  categories: Record<CategoryKey, CategoryResult>;
  recommendations: Recommendation[];
  assessment?: AssessmentResult | null;
}

export function renderReportEmail(input: ReportEmailInput): { subject: string; html: string } {
  const subject = `Your GetHired CV report — ${input.overallScore}% match`;

  const sections = OVERALL_SCORE_CATEGORIES.map((key, index) => categorySection(input.categories[key], index)).join(
    ""
  );

  const html = `
  <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:${FOG};">
    <div style="background:${PAPER};border-radius:12px;padding:24px;">
      <img src="${SITE_URL}/email_logo.png" alt="GetHired" width="200" height="50" style="display:block;width:200px;height:auto;margin:0 0 16px;border:0;" />
      <p style="margin:0 0 8px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.15em;">Rule-based screening — no AI grading</p>
      <h1 style="font-size:20px;color:${INK};margin:0 0 4px;">GetHired CV Report</h1>
      <p style="color:${SLATE};font-size:14px;margin:0 0 20px;">
        Here's how your CV matches up against real cybersecurity job requirements.
      </p>

      <div style="text-align:center;padding:20px 0 8px;border-bottom:1px solid #e5e7eb;margin-bottom:16px;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;color:${INK};">${input.overallScore}</div>
        <div style="color:${SLATE};font-size:13px;">Overall match score</div>
      </div>

      ${strengthsSection(input.categories)}

      <h2 style="font-size:16px;color:${INK};margin:20px 0 4px;border-top:1px solid #e5e7eb;padding-top:20px;">
        Section 2 — Worth adding
      </h2>
      <p style="color:${SLATE_FAINT};font-size:12px;margin:0 0 8px;">
        Not a checklist of requirements — these show up often in postings for this role and could strengthen
        your profile.
      </p>

      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${sections}
      </table>

      ${educationSection(input.categories.education)}

      <h2 style="font-size:16px;color:${INK};margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">
        Section 3 — Concrete suggestions
      </h2>
      ${recommendationsSection(input.recommendations)}

      ${assessmentSection(input.assessment ?? null)}

      <p style="color:${SLATE_FAINT};font-size:12px;margin-top:24px;">
        This report was generated automatically by GetHired's rule-based scoring engine — no AI involved.
        <span style="color:${BEACON};">•</span>
      </p>
    </div>
  </div>`;

  return { subject, html };
}
