import { NextResponse } from "next/server";
import { mcqBank, questionsForRole, scoreMcq, toMcqPrompts } from "@/lib/mcq";
import type { McqAnswerSubmission } from "@/lib/mcq";
import { DEFAULT_ROLE, isRoleKey } from "@/lib/roles";

export const runtime = "nodejs";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");
  const role = isRoleKey(roleParam) ? roleParam : DEFAULT_ROLE;

  return NextResponse.json({ questions: toMcqPrompts(questionsForRole(mcqBank, role)) });
}

interface McqSubmitBody {
  answers?: McqAnswerSubmission[];
  role?: string;
}

export async function POST(request: Request) {
  let body: McqSubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const validAnswers = answers.filter(
    (submission): submission is McqAnswerSubmission =>
      typeof submission?.questionId === "string" && typeof submission?.choiceId === "string"
  );
  const role = isRoleKey(body.role) ? body.role : DEFAULT_ROLE;

  const result = scoreMcq(validAnswers, questionsForRole(mcqBank, role));
  return NextResponse.json({ result });
}
