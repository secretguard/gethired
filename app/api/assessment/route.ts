import { NextResponse } from "next/server";
import { scenarioBank, scoreAssessment, toScenarioPrompts } from "@/lib/assessment";
import type { AnswerSubmission } from "@/lib/assessment";
import { insertLabScore } from "@/lib/supabase/labScores";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ scenarios: toScenarioPrompts(scenarioBank) });
}

interface AssessmentSubmitBody {
  answers?: AnswerSubmission[];
  screeningId?: string | null;
}

export async function POST(request: Request) {
  let body: AssessmentSubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const validAnswers = answers.filter(
    (submission): submission is AnswerSubmission =>
      typeof submission?.checkpointId === "string" && typeof submission?.answer === "string"
  );

  const result = scoreAssessment(validAnswers, scenarioBank);

  let labScoreId: string | null = null;
  if (body.screeningId) {
    try {
      labScoreId = await insertLabScore(body.screeningId, result);
    } catch (error) {
      console.error("Failed to persist lab score", error);
    }
  }

  return NextResponse.json({ result, labScoreId });
}
