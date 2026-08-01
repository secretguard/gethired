import questionsJson from "@/data/find-your-path-questions.json";
import { DEFAULT_ROLE, ROLE_ORDER, type RoleKey } from "@/lib/roles";
import type { FindYourPathQuestion, FindYourPathRecommendation } from "./types";

export const FIND_YOUR_PATH_QUESTIONS: FindYourPathQuestion[] = questionsJson.questions as FindYourPathQuestion[];

/** Within this many points of the leader, a second track is treated as "too close to call". */
const TIE_MARGIN = 2;

function zeroScores(): Record<RoleKey, number> {
  return Object.fromEntries(ROLE_ORDER.map((role) => [role, 0])) as Record<RoleKey, number>;
}

/**
 * Static, rule-based scoring: each selected option's fixed point values are
 * summed per role track (see data/find-your-path-questions.json), highest
 * total wins. No AI/LLM involved. Falls back to Generalist when the top two
 * tracks are within TIE_MARGIN points of each other, rather than guessing
 * between two closely-matched tracks.
 */
export function scoreQuestionnaire(selectedOptionIds: Record<string, string>): FindYourPathRecommendation {
  const scores = zeroScores();

  for (const question of FIND_YOUR_PATH_QUESTIONS) {
    const selectedId = selectedOptionIds[question.id];
    const option = question.options.find((candidate) => candidate.id === selectedId);
    if (!option) continue;
    for (const role of ROLE_ORDER) {
      scores[role] += option.points[role] ?? 0;
    }
  }

  const ranked = [...ROLE_ORDER].sort((a, b) => scores[b] - scores[a]);
  const [leader, runnerUp] = ranked;
  const tooClose = runnerUp !== undefined && scores[leader] - scores[runnerUp] < TIE_MARGIN;

  return {
    role: tooClose ? DEFAULT_ROLE : leader,
    scores,
    tooClose,
  };
}
