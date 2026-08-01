import { test, expect } from "@playwright/test";
import mcqData from "../data/mcq-questions.json";
import { selectTrack } from "./helpers";

test("answering every question correctly scores the quick check at 100%, with no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await selectTrack(page);
  await page.goto("/quiz");
  await page.click("text=Start the quick check");
  await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10_000 });

  for (const q of mcqData.questions) {
    await page.check(`input[name="${q.id}"][value="${q.correctChoiceId}"]`);
  }

  await page.click('button[type="submit"]');
  await expect(page.getByText("Quick check score")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("100").first()).toBeVisible();
  await expect(page.getByText("Missed")).toHaveCount(0);

  expect(consoleErrors).toEqual([]);
});

test("submit is disabled until every question is answered, then scores a mix correctly", async ({ page }) => {
  await selectTrack(page);
  await page.goto("/quiz");
  await page.click("text=Start the quick check");
  await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10_000 });

  await expect(page.locator('button[type="submit"]')).toBeDisabled();

  for (let i = 0; i < mcqData.questions.length; i++) {
    const q = mcqData.questions[i];
    const choiceId = i === 0 ? q.choices.find((c) => c.id !== q.correctChoiceId)!.id : q.correctChoiceId;
    await page.check(`input[name="${q.id}"][value="${choiceId}"]`);
  }

  await expect(page.locator('button[type="submit"]')).toBeEnabled();
  await page.click('button[type="submit"]');
  await expect(page.getByText("Quick check score")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Missed").first()).toBeVisible();
});

test("the homepage links to the quick check", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/quiz"]').first()).toBeVisible();
});
