import { NextResponse } from "next/server";
import { scenarioBank, scenariosForRole, scoreAssessment, toScenarioPrompts } from "@/lib/assessment";
import type { AnswerSubmission } from "@/lib/assessment";
import { DEFAULT_ROLE, isRoleKey } from "@/lib/roles";
import { insertLabScore } from "@/lib/supabase/labScores";

export const runtime = "nodejs";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");
  const role = isRoleKey(roleParam) ? roleParam : DEFAULT_ROLE;

  return NextResponse.json({ scenarios: toScenarioPrompts(scenariosForRole(scenarioBank, role)) });
}

interface AssessmentSubmitBody {
  answers?: AnswerSubmission[];
  screeningId?: string | null;
  role?: string;
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
  const role = isRoleKey(body.role) ? body.role : DEFAULT_ROLE;

  const result = scoreAssessment(validAnswers, scenariosForRole(scenarioBank, role), role);

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
