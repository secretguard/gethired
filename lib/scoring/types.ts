export type CategoryKey = "certifications" | "tools" | "concepts" | "soft_skills";

export interface CorpusItem {
  id: string;
  label: string;
  aliases: string[];
  weight: number;
}

export interface CorpusCategory {
  label: string;
  items: CorpusItem[];
}

export type Corpus = Record<CategoryKey, CorpusCategory>;

export interface MatchedItem {
  id: string;
  label: string;
  weight: number;
}

export interface CategoryResult {
  label: string;
  score: number;
  matchedWeight: number;
  totalWeight: number;
  matched: MatchedItem[];
  missing: MatchedItem[];
}

export interface ScoreResult {
  overallScore: number;
  categories: Record<CategoryKey, CategoryResult>;
  matched: MatchedItem[];
  missing: MatchedItem[];
}
