import { test, expect } from "@playwright/test";
import path from "node:path";
import scenarioData from "../data/assessment-scenarios.json";
import { selectTrack } from "./helpers";

const flatCheckpoints = scenarioData.scenarios.flatMap((scenario) => scenario.checkpoints);

async function screenSampleCv(page: import("@playwright/test").Page) {
  await selectTrack(page);
  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');
  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
}

test("submitting correct answers scores the assessment at 100%, with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await screenSampleCv(page);
  await page.click("text=Start the practical assessment");
  await expect(page.getByText("Submit assessment")).toBeVisible({ timeout: 10_000 });

  const inputs = await page.locator('form input[type="text"]').all();
  expect(inputs.length).toBe(flatCheckpoints.length);
  for (let i = 0; i < inputs.length; i++) {
    await inputs[i].fill(flatCheckpoints[i].acceptedAnswers[0]);
  }

  await page.click('button[type="submit"]');
  await expect(page.getByText("Assessment score")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("100").first()).toBeVisible();
  await expect(page.getByText("Missed")).toHaveCount(0);

  expect(consoleErrors).toEqual([]);
});

test("a mix of correct and incorrect answers produces a partial score with per-checkpoint feedback", async ({
  page,
}) => {
  await screenSampleCv(page);
  await page.click("text=Start the practical assessment");
  await expect(page.getByText("Submit assessment")).toBeVisible({ timeout: 10_000 });

  const inputs = await page.locator('form input[type="text"]').all();
  for (let i = 0; i < inputs.length; i++) {
    const value = i % 2 === 0 ? flatCheckpoints[i].acceptedAnswers[0] : "definitely wrong answer";
    await inputs[i].fill(value);
  }

  await page.click('button[type="submit"]');
  await expect(page.getByText("Assessment score")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Correct").first()).toBeVisible();
  await expect(page.getByText("Missed").first()).toBeVisible();
});

test("role gating (V4-P2): a non-generalist track sees fewer scenarios than Generalist, plus its own readiness score", async ({
  page,
}) => {
  const netSecScenarios = scenarioData.scenarios.filter((s) => s.roles.includes("network_security_engineer"));
  const netSecCheckpoints = netSecScenarios.flatMap((s) => s.checkpoints);
  expect(netSecCheckpoints.length).toBeLessThan(flatCheckpoints.length);

  await selectTrack(page, "Network Security");
  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');
  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });

  await page.click("text=Start the practical assessment");
  await expect(page.getByText("Submit assessment")).toBeVisible({ timeout: 10_000 });

  const inputs = await page.locator('form input[type="text"]').all();
  expect(inputs.length).toBe(netSecCheckpoints.length);
  for (let i = 0; i < inputs.length; i++) {
    await inputs[i].fill(netSecCheckpoints[i].acceptedAnswers[0]);
  }

  await page.click('button[type="submit"]');
  await expect(page.getByText("Assessment score")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Network Security readiness")).toBeVisible();
});
