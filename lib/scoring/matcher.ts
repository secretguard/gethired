function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary aware match: treats only [a-z0-9] as "word" characters so
 * symbols in terms like "Security+" or "TCP/IP" don't break \b semantics.
 */
function buildTermPattern(term: string): RegExp {
  const escaped = escapeRegExp(term.toLowerCase().trim());
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

export function textContainsTerm(normalizedText: string, term: string): boolean {
  return buildTermPattern(term).test(normalizedText);
}
