import { test, expect } from "@playwright/test";
import path from "node:path";
import scenarioData from "../data/assessment-scenarios.json";
import { selectTrack } from "./helpers";

const flatCheckpoints = scenarioData.scenarios.flatMap((scenario) => scenario.checkpoints);

async function screenAndCompleteAssessment(page: import("@playwright/test").Page, fillAnswer: (i: number) => string) {
  await selectTrack(page);
  await page.goto("/screen");
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

test("roadmap defaults to the diagram view, sequenced with numbered steps, no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await screenAndCompleteAssessment(page, (i) => (i % 3 === 0 ? flatCheckpoints[i].acceptedAnswers[0] : "nope"));

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Step 1", { exact: true })).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("toggling to the list view shows the same steps as numbered, connected list items", async ({ page }) => {
  await screenAndCompleteAssessment(page, (i) => (i % 3 === 0 ? flatCheckpoints[i].acceptedAnswers[0] : "nope"));

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  await page.click('button:has-text("List")');

  const stepBadges = page.locator("ol li span.font-mono.text-sm.font-semibold");
  const count = await stepBadges.count();
  expect(count).toBeGreaterThan(0);
  await expect(stepBadges.first()).toHaveText("1");

  // Toggling back to diagram should restore it without error.
  await page.click('button:has-text("Diagram")');
  await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
});

test("roadmap still renders from CV gaps alone when the assessment is answered perfectly", async ({ page }) => {
  // The sample CV itself has real gaps (see cv-screener.spec.ts), so even a
  // 100% assessment score should still produce a non-empty roadmap driven by
  // CV-sourced recommendations — this exercises the assessment=null-like
  // path (no assessment-sourced actions) without needing a second fixture.
  await screenAndCompleteAssessment(page, (i) => flatCheckpoints[i].acceptedAnswers[0]);

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Step 1", { exact: true })).toBeVisible();
});

test("project ideas (V4-P5): gap-tied project ideas render with a working external link", async ({ page }) => {
  await screenAndCompleteAssessment(page, (i) => (i % 3 === 0 ? flatCheckpoints[i].acceptedAnswers[0] : "nope"));

  await expect(page.getByText("Your roadmap")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Project ideas for your gaps")).toBeVisible();

  const link = page.getByRole("link", { name: /Pivoting & Tunneling lab|ShopEasy API security lab|Wazuh SOC lab guide|OSINT guide/ }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /^https:\/\/www\.sarathg\.me\//);
  await expect(link).toHaveAttribute("target", "_blank");
});

test("role gating (V4-P4): stage phrasing and the certification path callout differ by track", async ({
  page,
}) => {
  await selectTrack(page, "SOC Analyst");
  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');
  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
  await page.goto("/roadmap");

  await expect(page.getByText("SOC Analyst certification path")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("CompTIA CySA+")).toBeVisible();
  // VAPT's cert path should NOT appear on the SOC Analyst track's roadmap.
  await expect(page.getByText("eJPT")).toHaveCount(0);
});
