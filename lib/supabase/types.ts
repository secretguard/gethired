import type { CategoryKey, CategoryResult, MatchedItem } from "@/lib/scoring";
import type { AssessmentResult } from "@/lib/assessment";

export interface ScreeningRow {
  id: string;
  created_at: string;
  overall_score: number;
  category_breakdown: Record<CategoryKey, CategoryResult>;
  matched_keywords: MatchedItem[];
  missing_keywords: MatchedItem[];
}

export type ScreeningInsert = Omit<ScreeningRow, "id" | "created_at">;

export interface LabScoreRow {
  id: string;
  created_at: string;
  screening_id: string;
  score: AssessmentResult;
}

export type LabScoreInsert = Omit<LabScoreRow, "id" | "created_at">;
