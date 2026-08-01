import { NextResponse } from "next/server";
import { corpus, scoreCv } from "@/lib/scoring";
import { extractTextFromFile, UnsupportedFileTypeError } from "@/lib/parsing/extractText";
import { insertScreening } from "@/lib/supabase/screenings";
import { generateRecommendations } from "@/lib/recommendations";
import { ROLE_ORDER, DEFAULT_ROLE, isRoleKey } from "@/lib/roles";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a file field." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded. Attach a file under the 'file' field." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  let text: string;
  try {
    text = await extractTextFromFile(file);
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to extract text from uploaded file", error);
    return NextResponse.json({ error: "Could not read the uploaded file. Please try a different PDF or DOCX." }, { status: 422 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "No readable text found in the uploaded file." }, { status: 422 });
  }

  const requestedRole = formData.get("role");
  const primaryRole = isRoleKey(requestedRole) ? requestedRole : DEFAULT_ROLE;

  // Score against every role track from the same extracted text in one pass —
  // lets the client switch tracks instantly afterward (re-viewing results
  // against a different role) without re-uploading or re-parsing the CV.
  const results = Object.fromEntries(
    ROLE_ORDER.map((role) => {
      const result = scoreCv(text, corpus, role);
      const recommendations = generateRecommendations(result.categories);
      return [role, { result, recommendations }];
    })
  );

  let resultId: string | null = null;
  try {
    resultId = await insertScreening(results[primaryRole].result);
  } catch (error) {
    console.error("Failed to persist screening result", error);
  }

  return NextResponse.json({ results, primaryRole, resultId });
}
