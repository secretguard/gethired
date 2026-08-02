import type { McqCategoryKey, McqResult } from "@/lib/mcq";
import type { RoleKey } from "@/lib/roles";
import { resourcesForCategories } from "@/lib/resources";
import { INK, SLATE, SLATE_FAINT, FOG, PAPER, VERIFIED, BEACON, SITE_URL, scoreBarHtml } from "./template";

function categorySection(key: McqCategoryKey, category: McqResult["categories"][McqCategoryKey], role: RoleKey): string {
  // Same "missed this category? here's where to start" pairing as
  // McqResultsView's CategoryResourceLinks — reusing the Resource Library
  // matching rather than a second lookup.
  const resources =
    category.total > 0 && category.score < 100 ? resourcesForCategories(role, [key]).slice(0, 2) : [];
  const resourceLinks = resources.length
    ? `<p style="margin:6px 0 0;font-size:12px;color:${SLATE_FAINT};">Missed this category? ${resources
        .map((resource) => `<a href="${resource.url}" style="color:${VERIFIED};">${resource.title}</a>`)
        .join(" &middot; ")}</p>`
    : "";

  return `
    <tr>
      <td style="padding:14px 0;border-top:1px solid #e5e7eb;">
        <div style="display:flex;justify-content:space-between;font-weight:600;color:${INK};font-size:14px;margin-bottom:6px;">
          ${category.label} <span style="color:${SLATE};font-weight:500;">${category.score}%</span>
        </div>
        ${scoreBarHtml(category.score, category.score >= 70 ? VERIFIED : BEACON)}
        <p style="margin:6px 0 0;font-size:12px;color:${SLATE_FAINT};">${category.correctCount} / ${category.total} correct</p>
        ${resourceLinks}
      </td>
    </tr>`;
}

export interface QuizReportEmailInput {
  result: McqResult;
  role: RoleKey;
}

export function renderQuizReportEmail({ result, role }: QuizReportEmailInput): { subject: string; html: string } {
  const subject = `Your GetHired quick check — ${result.overallScore}% score`;

  const sections = (Object.keys(result.categories) as McqCategoryKey[])
    .map((key) => categorySection(key, result.categories[key], role))
    .join("");

  const html = `
  <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:${FOG};">
    <div style="background:${PAPER};border-radius:12px;padding:24px;">
      <img src="${SITE_URL}/email_logo.png" alt="GetHired" width="200" height="50" style="display:block;width:200px;height:auto;margin:0 0 16px;border:0;" />
      <p style="margin:0 0 8px;color:${SLATE_FAINT};font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.15em;">Rule-based quiz — no AI grading</p>
      <h1 style="font-size:20px;color:${INK};margin:0 0 4px;">Your Quick Check results</h1>
      <p style="color:${SLATE};font-size:14px;margin:0 0 20px;">
        A fast self-check across the same skill categories the CV screener and practical assessment use.
      </p>

      <div style="text-align:center;padding:20px 0 8px;border-bottom:1px solid #e5e7eb;margin-bottom:16px;">
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;color:${INK};">${result.overallScore}</div>
        <div style="color:${SLATE};font-size:13px;">Overall quick check score</div>
      </div>

      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${sections}
      </table>

      <p style="color:${SLATE_FAINT};font-size:12px;margin-top:24px;">
        This result was generated automatically by GetHired's rule-based quiz engine — no AI involved.
      </p>
    </div>
  </div>`;

  return { subject, html };
}
