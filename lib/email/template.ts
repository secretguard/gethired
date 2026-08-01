import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";
import { OVERALL_SCORE_CATEGORIES } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";
import type { AssessmentResult } from "@/lib/assessment";
import { ASSESSMENT_CATEGORY_ORDER } from "@/lib/assessment";

// Palette mirrors the app's design tokens (app/globals.css) — kept as literal
// hex here rather than shared constants because email HTML can't reference
// CSS custom properties, and most mail clients ignore web fonts, so this
// intentionally falls back to a system sans stack instead of the app's
// Space Grotesk/IBM Plex pairing.
const INK = "#12181f";
const SLATE = "#4b5568";
const SLATE_FAINT = "#8891a0";
const FOG = "#f3f5f7";
const PAPER = "#ffffff";
const BEACON = "#b8631a";
const VERIFIED = "#147a65";
const VERIFIED_SOFT = "#e4f3ef";
const SLATE_SOFT = "#eef0f3";

function chipList(items: MatchedItem[], background: string, color: string): string {
  if (items.length === 0) {
    return `<span style="color:${SLATE_FAINT};font-size:13px;">None</span>`;
  }
  return items
    .map(
      (item) =>
        `<span style="display:inline-block;background:${background};color:${color};border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${item.label}</span>`
    )
    .join("");
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
        <p style="margin:0 0 4px;color:${SLATE_FAINT};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Matched</p>
        <div style="margin-bottom:8px;">${chipList(result.matched, VERIFIED_SOFT, VERIFIED)}</div>
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
      <p style="margin:0 0 8px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.15em;">Rule-based screening — no AI grading</p>
      <h1 style="font-size:20px;color:${INK};margin:0 0 4px;">GetHired CV Report</h1>
      <p style="color:${SLATE};font-size:14px;margin:0 0 20px;">
        Here's how your CV matches up against real cybersecurity job requirements.
      </p>

      <div style="text-align:center;padding:20px 0;border-bottom:1px solid #e5e7eb;margin-bottom:8px;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;color:${INK};">${input.overallScore}</div>
        <div style="color:${SLATE};font-size:13px;">Overall match score</div>
      </div>

      <p style="color:${SLATE_FAINT};font-size:12px;margin:12px 0 0;">
        "Worth adding" isn't a checklist of requirements — these show up often in postings for this role and
        could strengthen your profile.
      </p>

      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${sections}
      </table>

      ${educationSection(input.categories.education)}

      <h2 style="font-size:16px;color:${INK};margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">
        Recommended next steps
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
