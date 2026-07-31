export type CategoryKey =
  | "certifications"
  | "tools"
  | "concepts_frameworks"
  | "scripting_programming"
  | "soft_skills"
  | "education";

/** Shape of each entry as authored in data/corpus.json. */
export interface RawCorpusItem {
  keyword: string;
  weight: number;
  count_basis?: string;
}

export type RawCorpusCategories = Record<CategoryKey, RawCorpusItem[]>;

export interface CorpusMeta {
  name: string;
  version: string;
  scope: string;
  roles_covered: string[];
  roles_explicitly_excluded: string[];
  sample_size_note: string;
  known_limitation: string;
  sources: string[];
}

/**
 * A corpus item after load-time processing: `keyword` is the literal,
 * displayable term; `matchTerms` are the derived substrings actually checked
 * against CV text (see deriveMatchTerms.ts). `countBasis` is carried through
 * for reference only — it never affects scoring.
 */
export interface CorpusItem {
  id: string;
  keyword: string;
  weight: number;
  countBasis?: string;
  matchTerms: string[];
}

export type Corpus = Record<CategoryKey, CorpusItem[]>;

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
