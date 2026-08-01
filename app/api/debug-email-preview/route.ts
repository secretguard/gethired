import { NextResponse } from "next/server";
import { renderReportEmail } from "@/lib/email/template";
import { scoreCv, corpus } from "@/lib/scoring";
import { generateRecommendations } from "@/lib/recommendations";

const SAMPLE_CV =
  "John Doe Cybersecurity Fresher Resume. Skills: Splunk SIEM, Wireshark, Nmap, Python scripting, Bash scripting, " +
  "TCP/IP networking, ISO 27001 awareness, vulnerability assessments, OWASP Top 10, incident response, CompTIA " +
  "Security Plus certification, B.Tech Computer Science, team player, communication skills, problem solving.";

export function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  const result = scoreCv(SAMPLE_CV, corpus);
  const recommendations = generateRecommendations(result.categories);
  const { html } = renderReportEmail({
    overallScore: result.overallScore,
    categories: result.categories,
    recommendations,
  });
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
