import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";

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

export interface ReportEmailInput {
  overallScore: number;
  categories: Record<CategoryKey, CategoryResult>;
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

      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
        This report was generated automatically by GetHired's rule-based scoring engine — no AI involved.
      </p>
    </div>
  </div>`;

  return { subject, html };
}
