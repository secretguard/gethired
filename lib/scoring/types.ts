import type { RoleKey, RoleWeights } from "@/lib/roles";

export type CategoryKey =
  | "certifications"
  | "tools"
  | "concepts_frameworks"
  | "scripting_programming"
  | "soft_skills"
  | "education";

/** Shape of each entry as authored in data/corpus.json — one weight per role track. */
export interface RawCorpusItem {
  keyword: string;
  weights: RoleWeights;
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
 * for reference only — it never affects scoring. `weights` carries one
 * weight per role track; scoring resolves the right one via the `role`
 * passed into `scoreCv`.
 */
export interface CorpusItem {
  id: string;
  keyword: string;
  weights: RoleWeights;
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
  role: RoleKey;
  overallScore: number;
  categories: Record<CategoryKey, CategoryResult>;
  matched: MatchedItem[];
  missing: MatchedItem[];
}
