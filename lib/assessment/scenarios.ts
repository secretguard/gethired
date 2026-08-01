import scenariosJson from "@/data/assessment-scenarios.json";
import type { ScenarioBank, ScenarioPrompt } from "./types";

export const scenarioBank: ScenarioBank = scenariosJson.scenarios as ScenarioBank;

/** Strips answer keys/explanations before a scenario is sent to the client. */
export function toScenarioPrompts(bank: ScenarioBank): ScenarioPrompt[] {
  return bank.map((scenario) => ({
    id: scenario.id,
    category: scenario.category,
    title: scenario.title,
    scenario: scenario.scenario,
    artifactLabel: scenario.artifactLabel,
    artifact: scenario.artifact,
    checkpoints: scenario.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      question: checkpoint.question,
      points: checkpoint.points,
    })),
  }));
}
