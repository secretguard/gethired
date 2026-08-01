import { test, expect } from "@playwright/test";
import path from "node:path";
import scenarioData from "../data/assessment-scenarios.json";

const flatCheckpoints = scenarioData.scenarios.flatMap((scenario) => scenario.checkpoints);

async function screenAndCompleteAssessment(page: import("@playwright/test").Page, fillAnswer: (i: number) => string) {
  await page.goto("/");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');
  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });

  await page.click("text=Start the practical assessment");
  await expect(page.getByText("Submit assessment")).toBeVisible({ timeout: 10_000 });

  const inputs = await page.locator('form input[type="text"]').all();
  for (let i = 0; i < inputs.length; i++) {
    await inputs[i].fill(fillAnswer(i));
  }

  await page.click('button[type="submit"]');
  await expect(page.getByText("Assessment score")).toBeVisible({ timeout: 15_000 });
}

test("roadmap appears after the assessment completes, sequenced with numbered steps", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await screenAndCompleteAssessment(page, (i) => (i % 3 === 0 ? flatCheckpoints[i].acceptedAnswers[0] : "nope"));

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  const stepBadges = page.locator("ol li span.font-mono.text-sm.font-semibold");
  const count = await stepBadges.count();
  expect(count).toBeGreaterThan(0);
  await expect(stepBadges.first()).toHaveText("1");

  expect(consoleErrors).toEqual([]);
});

test("roadmap still renders from CV gaps alone when the assessment is answered perfectly", async ({ page }) => {
  // The sample CV itself has real gaps (see cv-screener.spec.ts), so even a
  // 100% assessment score should still produce a non-empty roadmap driven by
  // CV-sourced recommendations — this exercises the assessment=null-like
  // path (no assessment-sourced actions) without needing a second fixture.
  await screenAndCompleteAssessment(page, (i) => flatCheckpoints[i].acceptedAnswers[0]);

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  const stepBadges = page.locator("ol li span.font-mono.text-sm.font-semibold");
  expect(await stepBadges.count()).toBeGreaterThan(0);
});
