/**
 * Corpus keywords are written for human readability, not literal CV matching
 * — e.g. "SIEM (generic + Splunk specifically)", "Firewall / IDS / IPS
 * platforms", "TCP/IP & core networking". This module derives the actual
 * substrings to check for from each keyword, so the matcher isn't limited to
 * an exact-phrase check that would rarely hit real CV text.
 */

// Compounds that must never be split on "/" even though other keywords use
// "/" as an enumeration delimiter (e.g. "Firewall / IDS / IPS platforms").
const PROTECTED_COMPOUNDS = ["TCP/IP"];

// Words that carry no matchable signal on their own — dropped when they
// appear as a standalone split token.
const FILLER_WORDS = new Set([
  "in",
  "or",
  "and",
  "the",
  "a",
  "an",
  "of",
  "for",
  "with",
  "specifically",
  "generic",
  "only",
  "conceptual",
  "tag",
  "level",
  "awareness",
]);

// Trailing generic nouns that, when stripped, reveal a much more
// CV-realistic term (e.g. "Penetration testing methodology" -> "Penetration
// testing"). Both the original and stripped form are kept as match terms.
const TRAILING_FILLER_SUFFIXES = ["basics", "platforms", "methodology", "fundamentals", "skills"];

// Common lead-in phrases from job-posting language that CVs themselves don't
// typically repeat (e.g. "Willingness to work shifts" -> "shifts").
const PREFIX_FILLERS = [
  "willingness to work",
  "ability to",
  "experience with",
  "exposure to",
  "knowledge of",
  "familiarity with",
  "understanding of",
];

// Short tokens that double as common English words — never safe to match
// case-insensitively as standalone terms (e.g. "IT" the abbreviation vs.
// "it" the pronoun).
const AMBIGUOUS_SHORT_WORDS = new Set([
  "it",
  "is",
  "in",
  "or",
  "an",
  "a",
  "of",
  "if",
  "on",
  "to",
  "be",
  "by",
  "do",
  "go",
  "no",
  "so",
  "up",
  "us",
  "we",
  "as",
]);

// Phrases with no matchable signal at all — dropped entirely, not just
// word-by-word.
const DROP_TERMS = new Set(["related field", "or related field"]);

function protectCompounds(text: string): { protectedText: string; restore: Map<string, string> } {
  let protectedText = text;
  const restore = new Map<string, string>();

  PROTECTED_COMPOUNDS.forEach((compound, index) => {
    if (protectedText.includes(compound)) {
      const token = `__PROTECTED_${index}__`;
      protectedText = protectedText.split(compound).join(token);
      restore.set(token, compound);
    }
  });

  return { protectedText, restore };
}

function restoreCompounds(text: string, restore: Map<string, string>): string {
  let restored = text;
  for (const [token, compound] of restore) {
    restored = restored.split(token).join(compound);
  }
  return restored;
}

function stripFillerWords(term: string): string {
  return term
    .split(/\s+/)
    .filter((word) => !FILLER_WORDS.has(word.toLowerCase()))
    .join(" ")
    .trim();
}

function stripPrefixFiller(term: string): string | null {
  const lower = term.toLowerCase();
  for (const prefix of PREFIX_FILLERS) {
    if (lower.startsWith(prefix)) {
      const stripped = term.slice(prefix.length).trim();
      return stripped.length > 0 ? stripped : null;
    }
  }
  return null;
}

function stripTrailingFillerSuffix(term: string): string | null {
  const words = term.split(/\s+/);
  if (words.length < 2) return null;

  const last = words[words.length - 1].toLowerCase();
  if (!TRAILING_FILLER_SUFFIXES.includes(last)) return null;

  const stripped = words.slice(0, -1).join(" ").trim();
  return stripped.length > 0 ? stripped : null;
}

function splitIntoRawTerms(text: string): string[] {
  const { protectedText, restore } = protectCompounds(text);

  const rawTokens = protectedText.split(/\s*\/\s*|\s*,\s*|\s+or\s+|\s*&\s*|\s+\+\s+/gi);

  return rawTokens.map((token) => restoreCompounds(token, restore).trim()).filter(Boolean);
}

function isAcronym(text: string): boolean {
  return /^[A-Z0-9&/]{2,8}$/.test(text);
}

function addTermVariants(term: string, out: Set<string>): void {
  const filtered = stripFillerWords(term);
  if (!filtered) return;
  if (DROP_TERMS.has(filtered.toLowerCase())) return;
  if (filtered.length <= 2 && AMBIGUOUS_SHORT_WORDS.has(filtered.toLowerCase())) return;

  out.add(filtered);

  const prefixStripped = stripPrefixFiller(filtered);
  if (prefixStripped) addTermVariants(prefixStripped, out);

  const suffixStripped = stripTrailingFillerSuffix(filtered);
  if (suffixStripped) addTermVariants(suffixStripped, out);
}

export function deriveMatchTerms(keyword: string): string[] {
  const terms = new Set<string>();

  const parenMatches = [...keyword.matchAll(/\(([^)]+)\)/g)];
  const base = keyword.replace(/\([^)]+\)/g, " ").trim();

  for (const match of parenMatches) {
    const content = match[1].trim();
    if (isAcronym(content)) {
      addTermVariants(content, terms);
    } else {
      splitIntoRawTerms(content).forEach((term) => addTermVariants(term, terms));
    }
  }

  splitIntoRawTerms(base).forEach((term) => addTermVariants(term, terms));

  return [...terms].filter((term) => {
    const lower = term.toLowerCase();
    return term.length > 1 && !(term.length <= 2 && AMBIGUOUS_SHORT_WORDS.has(lower));
  });
}
