/**
 * Normalizes a free-text answer for comparison: lowercase, trim, collapse
 * whitespace, and strip trailing punctuation so "SQL Injection." and
 * "sql injection" both match the same accepted answer.
 */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

export function answerMatches(submitted: string, acceptedAnswers: string[]): boolean {
  const normalizedSubmitted = normalizeAnswer(submitted);
  if (!normalizedSubmitted) return false;
  return acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === normalizedSubmitted);
}
