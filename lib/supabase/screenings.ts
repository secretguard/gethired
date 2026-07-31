import "server-only";
import type { ScoreResult } from "@/lib/scoring";
import { getSupabaseServerClient } from "./server";
import type { ScreeningInsert } from "./types";

export async function insertScreening(result: ScoreResult): Promise<string> {
  const client = getSupabaseServerClient();

  const row: ScreeningInsert = {
    overall_score: result.overallScore,
    category_breakdown: result.categories,
    matched_keywords: result.matched,
    missing_keywords: result.missing,
  };

  const { data, error } = await client.from("screenings").insert(row).select("id").single();

  if (error || !data) {
    throw new Error(`Failed to persist screening: ${error?.message ?? "unknown error"}`);
  }

  return data.id as string;
}
