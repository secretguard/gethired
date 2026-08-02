import { NextResponse } from "next/server";
import { z } from "zod";
import { getResendClient, REPORT_FROM_ADDRESS } from "@/lib/email/resend";
import { renderQuizReportEmail } from "@/lib/email/quizTemplate";
import type { McqResult } from "@/lib/mcq";
import { isRoleKey } from "@/lib/roles";
import type { RoleKey } from "@/lib/roles";
import { clientIp, createRateLimiter } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Quiz results aren't persisted anywhere server-side (see lib/mcq's own
// docs — deliberately lighter-weight, no Supabase write), so unlike
// /api/send-report there's no resultId to look up: the client sends the
// McqResult it already holds in state, validated here before it's ever
// rendered into HTML.
const mcqCategoryResultSchema = z.object({
  label: z.string(),
  score: z.number(),
  total: z.number(),
  correctCount: z.number(),
});

const mcqQuestionResultSchema = z.object({
  id: z.string(),
  question: z.string(),
  correct: z.boolean(),
  submittedChoiceId: z.string().nullable(),
  correctChoiceId: z.string(),
  explanation: z.string(),
});

const sendQuizReportSchema = z.object({
  email: z.string().email(),
  role: z.string().refine(isRoleKey, "Invalid role"),
  result: z.object({
    overallScore: z.number(),
    categories: z.record(z.string(), mcqCategoryResultSchema),
    questions: z.array(mcqQuestionResultSchema),
  }),
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

  const parsed = sendQuizReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid email address and quiz result." }, { status: 400 });
  }

  const { email, role, result } = parsed.data;
  const { subject, html } = renderQuizReportEmail({ result: result as McqResult, role: role as RoleKey });

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: REPORT_FROM_ADDRESS,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend failed to send quiz report email", error);
      return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("Unexpected error sending quiz report email", error);
    return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
