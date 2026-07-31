function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary aware match: treats only [a-z0-9] as "word" characters so
 * symbols in aliases like "Security+" or "CySA+" don't break \b semantics.
 */
function buildAliasPattern(alias: string): RegExp {
  const escaped = escapeRegExp(alias.toLowerCase().trim());
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

export function textContainsAlias(normalizedText: string, alias: string): boolean {
  return buildAliasPattern(alias).test(normalizedText);
}
