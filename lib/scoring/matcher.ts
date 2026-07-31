function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A literal space or a dot separating words in a term (e.g. "ISO 27001",
// "B.Tech") is treated as a flexible separator so punctuation/formatting
// variants a real CV might use — "ISO-27001", "ISO/27001", "B Tech",
// "BTech" — still match. Purely additive: anything that matched before
// still matches, since the flexible class is a superset of the literal
// space/dot it replaces.
const FLEXIBLE_SEPARATOR = "[\\s./-]*";

/**
 * Word-boundary aware match: treats only [a-z0-9] as "word" characters so
 * symbols in terms like "Security+" or "TCP/IP" don't break \b semantics.
 *
 * Also allows an optional trailing "s"/"es" so simple pluralization (CV says
 * "vulnerability assessments", corpus says "Vulnerability assessment", or
 * vice versa when the corpus term itself is already plural) doesn't cause a
 * miss. This only ever extends the match to include an extra suffix — it
 * never narrows what already matched — so it can't introduce a new false
 * positive on its own.
 */
function buildTermPattern(term: string): RegExp {
  const escaped = escapeRegExp(term.toLowerCase().trim());
  const flexible = escaped.replace(/ |\\\./g, FLEXIBLE_SEPARATOR);
  return new RegExp(`(?<![a-z0-9])${flexible}(?:es|s)?(?![a-z0-9])`, "i");
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

export function textContainsTerm(normalizedText: string, term: string): boolean {
  return buildTermPattern(term).test(normalizedText);
}
