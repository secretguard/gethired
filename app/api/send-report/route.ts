import { NextResponse } from "next/server";
import { z } from "zod";
import { getScreeningById } from "@/lib/supabase/screenings";
import { getResendClient, REPORT_FROM_ADDRESS } from "@/lib/email/resend";
import { renderReportEmail } from "@/lib/email/template";
import { generateRecommendations } from "@/lib/recommendations";

export const runtime = "nodejs";

const sendReportSchema = z.object({
  resultId: z.string().uuid(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = sendReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid resultId and email address." }, { status: 400 });
  }

  const { resultId, email } = parsed.data;

  let screening;
  try {
    screening = await getScreeningById(resultId);
  } catch (error) {
    console.error("Failed to fetch screening for report email", error);
    return NextResponse.json({ error: "Could not look up that report right now." }, { status: 500 });
  }

  if (!screening) {
    return NextResponse.json({ error: "No report found for that result." }, { status: 404 });
  }

  const { subject, html } = renderReportEmail({
    overallScore: screening.overall_score,
    categories: screening.category_breakdown,
    recommendations: generateRecommendations(screening.category_breakdown),
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
      console.error("Resend failed to send report email", error);
      return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
    }
  } catch (error) {
    console.error("Unexpected error sending report email", error);
    return NextResponse.json({ error: "Failed to send the email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
