import type {
  CategoryKey,
  CategoryResult,
  Corpus,
  CorpusItem,
  MatchedItem,
  ScoreResult,
} from "./types";
import type { RoleKey } from "@/lib/roles";
import { normalizeText, textContainsTerm } from "./matcher";
import { CATEGORY_LABELS, OVERALL_SCORE_CATEGORIES } from "./corpus";

function itemMatches(normalizedText: string, item: CorpusItem): boolean {
  return item.matchTerms.some((term) => textContainsTerm(normalizedText, term));
}

function toMatchedItem(item: CorpusItem, role: RoleKey): MatchedItem {
  return { id: item.id, label: item.keyword, weight: item.weights[role] };
}

function scoreCategory(
  normalizedText: string,
  categoryLabel: string,
  items: CorpusItem[],
  role: RoleKey
): CategoryResult {
  const matched: MatchedItem[] = [];
  const missing: MatchedItem[] = [];

  for (const item of items) {
    if (itemMatches(normalizedText, item)) {
      matched.push(toMatchedItem(item, role));
    } else {
      missing.push(toMatchedItem(item, role));
    }
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weights[role], 0);
  const matchedWeight = matched.reduce((sum, item) => sum + item.weight, 0);
  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

  return {
    label: categoryLabel,
    score,
    matchedWeight,
    totalWeight,
    matched,
    missing,
  };
}

/** Scores a CV against the corpus using the given role track's per-item weights. */
export function scoreCv(cvText: string, corpus: Corpus, role: RoleKey): ScoreResult {
  const normalizedText = normalizeText(cvText);
  const categoryKeys = Object.keys(corpus) as CategoryKey[];

  const categories = {} as Record<CategoryKey, CategoryResult>;
  let overallTotalWeight = 0;
  let overallMatchedWeight = 0;
  const matched: MatchedItem[] = [];
  const missing: MatchedItem[] = [];

  for (const key of categoryKeys) {
    const items = corpus[key];
    const result = scoreCategory(normalizedText, CATEGORY_LABELS[key], items, role);
    categories[key] = result;
    if (OVERALL_SCORE_CATEGORIES.includes(key)) {
      overallTotalWeight += result.totalWeight;
      overallMatchedWeight += result.matchedWeight;
    }
    matched.push(...result.matched);
    missing.push(...result.missing);
  }

  const overallScore =
    overallTotalWeight === 0 ? 0 : Math.round((overallMatchedWeight / overallTotalWeight) * 100);

  return {
    role,
    overallScore,
    categories,
    matched,
    missing,
  };
}
