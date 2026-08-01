import { NextResponse } from "next/server";
import { mcqBank, scoreMcq, toMcqPrompts } from "@/lib/mcq";
import type { McqAnswerSubmission } from "@/lib/mcq";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ questions: toMcqPrompts(mcqBank) });
}

interface McqSubmitBody {
  answers?: McqAnswerSubmission[];
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

  const result = scoreMcq(validAnswers, mcqBank);
  return NextResponse.json({ result });
}
