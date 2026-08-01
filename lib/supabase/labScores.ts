import "server-only";
import type { AssessmentResult } from "@/lib/assessment";
import { getSupabaseServerClient } from "./server";
import type { LabScoreInsert, LabScoreRow } from "./types";

export async function insertLabScore(screeningId: string, result: AssessmentResult): Promise<string> {
  const client = getSupabaseServerClient();

  const row: LabScoreInsert = {
    screening_id: screeningId,
    score: result,
  };

  const { data, error } = await client.from("lab_scores").insert(row).select("id").single();

  if (error || !data) {
    throw new Error(`Failed to persist lab score: ${error?.message ?? "unknown error"}`);
  }

  return data.id as string;
}

export async function getLabScoreByScreeningId(screeningId: string): Promise<LabScoreRow | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from("lab_scores")
    .select("*")
    .eq("screening_id", screeningId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lab score: ${error.message}`);
  }

  return (data as LabScoreRow) ?? null;
}
