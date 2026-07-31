import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";

export interface ScreeningRow {
  id: string;
  created_at: string;
  overall_score: number;
  category_breakdown: Record<CategoryKey, CategoryResult>;
  matched_keywords: MatchedItem[];
  missing_keywords: MatchedItem[];
}

export type ScreeningInsert = Omit<ScreeningRow, "id" | "created_at">;
