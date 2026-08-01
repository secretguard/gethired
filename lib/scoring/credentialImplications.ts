import credentialImplicationsJson from "@/data/credential-implications.json";
import type { CategoryKey, CategoryResult, Corpus } from "./types";

interface ImpliedSkill {
  id: string;
  basis: string;
}

interface CredentialImplication {
  certLabel: string;
  sources: string[];
  implies: ImpliedSkill[];
}

/**
 * Static, researched lookup of what each certification's official exam
 * objectives actually cover (see data/credential-implications.json for the
 * full sourcing/citations). Keyed by the certification's own corpus item id.
 */
export const CREDENTIAL_IMPLICATIONS: Record<string, CredentialImplication> = credentialImplicationsJson.implications;

function buildItemCategoryIndex(corpus: Corpus): Map<string, CategoryKey> {
  const index = new Map<string, CategoryKey>();
  for (const category of Object.keys(corpus) as CategoryKey[]) {
    for (const item of corpus[category]) {
      index.set(item.id, category);
    }
  }
  return index;
}

/**
 * Applies the credential-implies-skill table: for every matched
 * certification with an entry in CREDENTIAL_IMPLICATIONS, any implied corpus
 * item still sitting in that category's `missing` list is moved to `matched`
 * (tagged with which credential implied it) and the category's score is
 * recomputed. Items the corpus already matched directly are left untouched —
 * this only ever adds matches, never removes one, and never invents an
 * implied item that doesn't already exist somewhere in the corpus.
 */
export function applyCredentialImplications(
  categories: Record<CategoryKey, CategoryResult>,
  corpus: Corpus
): Record<CategoryKey, CategoryResult> {
  const itemCategoryIndex = buildItemCategoryIndex(corpus);
  const matchedCertIds = categories.certifications.matched.map((item) => item.id);

  const next = Object.fromEntries(
    (Object.keys(categories) as CategoryKey[]).map((key) => [
      key,
      { ...categories[key], matched: [...categories[key].matched], missing: [...categories[key].missing] },
    ])
  ) as Record<CategoryKey, CategoryResult>;

  for (const certId of matchedCertIds) {
    const implication = CREDENTIAL_IMPLICATIONS[certId];
    if (!implication) continue;

    for (const { id: impliedId } of implication.implies) {
      const targetCategoryKey = itemCategoryIndex.get(impliedId);
      if (!targetCategoryKey) continue;
      const targetCategory = next[targetCategoryKey];

      const existingMatch = targetCategory.matched.find((item) => item.id === impliedId);
      if (existingMatch) {
        if (existingMatch.impliedBy) {
          existingMatch.impliedBy = [...new Set([...existingMatch.impliedBy, implication.certLabel])];
        }
        continue;
      }

      const missingIndex = targetCategory.missing.findIndex((item) => item.id === impliedId);
      if (missingIndex === -1) continue;

      const [movedItem] = targetCategory.missing.splice(missingIndex, 1);
      targetCategory.matched.push({ ...movedItem, impliedBy: [implication.certLabel] });
      targetCategory.matchedWeight += movedItem.weight;
    }
  }

  for (const key of Object.keys(next) as CategoryKey[]) {
    const category = next[key];
    category.score = category.totalWeight === 0 ? 0 : Math.round((category.matchedWeight / category.totalWeight) * 100);
  }

  return next;
}
