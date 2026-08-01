import { NextResponse } from "next/server";
import { renderReportEmail } from "@/lib/email/template";
import { scoreCv, corpus } from "@/lib/scoring";
import { generateRecommendations } from "@/lib/recommendations";
import { scenarioBank, scoreAssessment } from "@/lib/assessment";

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

  const sampleAssessmentAnswers = scenarioBank.flatMap((scenario) =>
    scenario.checkpoints.slice(0, 1).map((checkpoint) => ({
      checkpointId: checkpoint.id,
      answer: checkpoint.acceptedAnswers[0],
    }))
  );
  const assessment = scoreAssessment(sampleAssessmentAnswers, scenarioBank);

  const { html } = renderReportEmail({
    overallScore: result.overallScore,
    categories: result.categories,
    recommendations,
    assessment,
  });
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
