import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";
import type { Recommendation } from "@/lib/recommendations";

const CATEGORY_ORDER: CategoryKey[] = ["certifications", "tools", "concepts", "soft_skills"];

function chipList(items: MatchedItem[], background: string, color: string): string {
  if (items.length === 0) {
    return `<span style="color:#9ca3af;font-size:13px;">None</span>`;
  }
  return items
    .map(
      (item) =>
        `<span style="display:inline-block;background:${background};color:${color};border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${item.label}</span>`
    )
    .join("");
}

function categorySection(result: CategoryResult): string {
  return `
    <tr>
      <td style="padding:16px 0;border-top:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;font-weight:600;color:#111827;font-size:15px;margin-bottom:8px;">
          ${result.label} <span style="color:#6b7280;font-weight:500;">${result.score}% match</span>
        </div>
        <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Matched</p>
        <div style="margin-bottom:8px;">${chipList(result.matched, "#ecfdf5", "#047857")}</div>
        <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Missing</p>
        <div>${chipList(result.missing, "#f3f4f6", "#6b7280")}</div>
      </td>
    </tr>`;
}

function recommendationsSection(recommendations: Recommendation[]): string {
  if (recommendations.length === 0) {
    return `<p style="color:#6b7280;font-size:13px;">No major gaps found — your CV already covers the categories we check well.</p>`;
  }

  const items = recommendations
    .map(
      (rec, index) => `
        <li style="margin-bottom:10px;">
          <span style="font-weight:600;color:#111827;">${index + 1}. ${rec.title}</span>
          <span style="color:#9ca3af;font-size:12px;"> (${rec.categoryLabel})</span>
          <div style="color:#6b7280;font-size:13px;">${rec.detail}</div>
        </li>`
    )
    .join("");

  return `<ol style="padding-left:20px;margin:0;">${items}</ol>`;
}

export interface ReportEmailInput {
  overallScore: number;
  categories: Record<CategoryKey, CategoryResult>;
  recommendations: Recommendation[];
}

export function renderReportEmail(input: ReportEmailInput): { subject: string; html: string } {
  const subject = `Your GetHired CV report — ${input.overallScore}% match`;

  const sections = CATEGORY_ORDER.map((key) => categorySection(input.categories[key])).join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;">
    <div style="background:#ffffff;border-radius:12px;padding:24px;">
      <h1 style="font-size:20px;color:#111827;margin:0 0 4px;">GetHired CV Report</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">
        Here's how your CV matches up against real cybersecurity job requirements.
      </p>

      <div style="text-align:center;padding:20px 0;border-bottom:1px solid #e5e7eb;margin-bottom:8px;">
        <div style="font-size:36px;font-weight:700;color:#111827;">${input.overallScore}</div>
        <div style="color:#6b7280;font-size:13px;">Overall match score</div>
      </div>

      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${sections}
      </table>

      <h2 style="font-size:16px;color:#111827;margin:24px 0 12px;border-top:1px solid #e5e7eb;padding-top:20px;">
        Recommended next steps
      </h2>
      ${recommendationsSection(input.recommendations)}

      <div style="margin-top:20px;border:1px dashed #d1d5db;border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0;color:#6b7280;font-size:13px;font-weight:600;">Practical assessment: coming soon</p>
        <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">This report is currently based on your CV alone.</p>
      </div>

      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
        This report was generated automatically by GetHired's rule-based scoring engine — no AI involved.
      </p>
    </div>
  </div>`;

  return { subject, html };
}
