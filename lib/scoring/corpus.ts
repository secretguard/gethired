import corpusJson from "@/data/corpus.json";
import { deriveMatchTerms } from "./deriveMatchTerms";
import type { CategoryKey, Corpus, CorpusItem, CorpusMeta, RawCorpusCategories, RawCorpusItem } from "./types";

function slugify(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCorpusItem(raw: RawCorpusItem): CorpusItem {
  return {
    id: slugify(raw.keyword),
    keyword: raw.keyword,
    weight: raw.weight,
    countBasis: raw.count_basis,
    matchTerms: deriveMatchTerms(raw.keyword),
  };
}

const rawCategories = corpusJson.categories as unknown as RawCorpusCategories;

export const corpus: Corpus = Object.fromEntries(
  (Object.keys(rawCategories) as CategoryKey[]).map((key) => [key, rawCategories[key].map(toCorpusItem)])
) as Corpus;

export const corpusMeta: CorpusMeta = corpusJson.corpus_meta as CorpusMeta;

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  certifications: "Certifications",
  tools: "Tools",
  concepts_frameworks: "Concepts & Frameworks",
  scripting_programming: "Scripting & Programming",
  soft_skills: "Soft Skills",
  education: "Education",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "certifications",
  "tools",
  "concepts_frameworks",
  "scripting_programming",
  "soft_skills",
  "education",
];

/**
 * Education is informational only — a degree isn't something a candidate can
 * change in any short/medium timeframe, and plenty of legitimate fresher
 * candidates come from non-traditional backgrounds. It's excluded from the
 * overall match percentage so the score reflects actionable skill gaps, not
 * degree type.
 */
export const OVERALL_SCORE_CATEGORIES: CategoryKey[] = CATEGORY_ORDER.filter((key) => key !== "education");
