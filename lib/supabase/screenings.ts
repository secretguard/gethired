import "server-only";
import type { ScoreResult } from "@/lib/scoring";
import { getSupabaseServerClient } from "./server";
import type { ScreeningInsert, ScreeningRow } from "./types";

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

export async function getScreeningById(id: string): Promise<ScreeningRow | null> {
  const client = getSupabaseServerClient();

  const { data, error } = await client.from("screenings").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch screening: ${error.message}`);
  }

  return (data as ScreeningRow) ?? null;
}
