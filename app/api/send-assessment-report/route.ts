import { NextResponse } from "next/server";
import { z } from "zod";
import { getResendClient, REPORT_FROM_ADDRESS } from "@/lib/email/resend";
import { renderAssessmentReportEmail } from "@/lib/email/assessmentTemplate";
import type { AssessmentResult } from "@/lib/assessment";
import type { Recommendation } from "@/lib/recommendations";
import { isRoleKey } from "@/lib/roles";
import type { RoleKey } from "@/lib/roles";
import { clientIp, createRateLimiter } from "@/lib/rateLimit";

export const runtime = "nodejs";

// The Practical Assessment can be taken standalone with no CV screening
// (screeningId is null in that case — see app/assessment/page.tsx), so
// there's no persisted screening row to look up like /api/send-report
// does. The client sends the AssessmentResult and any CV recommendations
// it already holds in state (empty if no CV was screened this session);
// the roadmap is recomputed server-side from lib/roadmap's real engine,
// not duplicated, so it matches exactly what the results page shows.
const assessmentCategoryResultSchema = z.object({
  label: z.string(),
  score: z.number(),
  totalPoints: z.number(),
  earnedPoints: z.number(),
});

const checkpointResultSchema = z.object({
  id: z.string(),
  question: z.string(),
  correct: z.boolean(),
  points: z.number(),
  pointsAwarded: z.number(),
  submittedAnswer: z.string(),
  explanation: z.string(),
});

const scenarioResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  checkpoints: z.array(checkpointResultSchema),
});

const roleReadinessSchema = z.object({
  role: z.string(),
  label: z.string(),
  score: z.number(),
  categories: z.array(z.string()),
});

const recommendationSchema = z.object({
  id: z.string(),
  category: z.string(),
  categoryLabel: z.string(),
  title: z.string(),
  detail: z.string(),
  weight: z.number(),
});

const sendAssessmentReportSchema = z.object({
  email: z.string().email(),
  role: z.string().refine(isRoleKey, "Invalid role"),
  result: z.object({
    overallScore: z.number(),
    categories: z.record(z.string(), assessmentCategoryResultSchema),
    scenarios: z.array(scenarioResultSchema),
    roleReadiness: roleReadinessSchema,
  }),
  recommendations: z.array(recommendationSchema).default([]),
});

// Same abuse-guard shape as /api/send-report's own rate limiter.
const checkRateLimit = createRateLimiter(10 * 60 * 1000, 5);

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(clientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = sendAssessmentReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid email address and assessment result." }, { status: 400 });
  }

  const { email, role, result, recommendations } = parsed.data;
  const { subject, html } = renderAssessmentReportEmail({
    result: result as AssessmentResult,
    role: role as RoleKey,
    recommendations: recommendations as Recommendation[],
  });

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: REPORT_FROM_ADDRESS,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend failed to send assessment report email", error);
      return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("Unexpected error sending assessment report email", error);
    return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
