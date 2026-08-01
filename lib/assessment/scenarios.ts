import scenariosJson from "@/data/assessment-scenarios.json";
import type { RoleKey } from "@/lib/roles";
import type { ScenarioBank, ScenarioPrompt } from "./types";

export const scenarioBank: ScenarioBank = scenariosJson.scenarios as ScenarioBank;

/** Strict role gating: only the scenarios tagged for this role track. */
export function scenariosForRole(bank: ScenarioBank, role: RoleKey): ScenarioBank {
  return bank.filter((scenario) => scenario.roles.includes(role));
}

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
