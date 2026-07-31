import type {
  CategoryKey,
  CategoryResult,
  Corpus,
  CorpusItem,
  MatchedItem,
  ScoreResult,
} from "./types";
import { normalizeText, textContainsAlias } from "./matcher";

function itemMatches(normalizedText: string, item: CorpusItem): boolean {
  return item.aliases.some((alias) => textContainsAlias(normalizedText, alias));
}

function toMatchedItem(item: CorpusItem): MatchedItem {
  return { id: item.id, label: item.label, weight: item.weight };
}

function scoreCategory(normalizedText: string, categoryLabel: string, items: CorpusItem[]): CategoryResult {
  const matched: MatchedItem[] = [];
  const missing: MatchedItem[] = [];

  for (const item of items) {
    if (itemMatches(normalizedText, item)) {
      matched.push(toMatchedItem(item));
    } else {
      missing.push(toMatchedItem(item));
    }
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
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

export function scoreCv(cvText: string, corpus: Corpus): ScoreResult {
  const normalizedText = normalizeText(cvText);
  const categoryKeys = Object.keys(corpus) as CategoryKey[];

  const categories = {} as Record<CategoryKey, CategoryResult>;
  let totalWeight = 0;
  let matchedWeight = 0;
  const matched: MatchedItem[] = [];
  const missing: MatchedItem[] = [];

  for (const key of categoryKeys) {
    const category = corpus[key];
    const result = scoreCategory(normalizedText, category.label, category.items);
    categories[key] = result;
    totalWeight += result.totalWeight;
    matchedWeight += result.matchedWeight;
    matched.push(...result.matched);
    missing.push(...result.missing);
  }

  const overallScore = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

  return {
    overallScore,
    categories,
    matched,
    missing,
  };
}
