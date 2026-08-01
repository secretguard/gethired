import { test, expect } from "@playwright/test";
import path from "node:path";
import { selectTrack } from "./helpers";

test("homepage shows the track picker (not tool cards) before a track is selected", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "GetHired" })).toBeVisible();
  await expect(page.getByText("Step 1 — pick your track")).toBeVisible();
  // The header's static nav still links to /screen regardless of gating (the
  // gate itself lives on the destination page) — what should NOT be present
  // pre-selection is the homepage's own tool-card grid.
  await expect(page.getByText("CH.00")).toHaveCount(0);
});

test("picking a track on the homepage reveals all four tools as independently reachable", async ({ page }) => {
  await selectTrack(page, "SOC Analyst");

  await expect(page.getByText("Your track:")).toBeVisible();
  await expect(page.locator('a[href="/screen"]').first()).toBeVisible();
  await expect(page.locator('a[href="/assessment"]').first()).toBeVisible();
  await expect(page.locator('a[href="/quiz"]').first()).toBeVisible();
  await expect(page.locator('a[href="/roadmap"]').first()).toBeVisible();
});

test("visiting a gated tool page directly, with no track picked, shows a pick-your-track prompt instead of the tool", async ({
  page,
}) => {
  await page.goto("/screen");
  await expect(page.getByText("Pick your track")).toBeVisible();
  await expect(page.locator("#cv-file")).toHaveCount(0);

  await page.goto("/quiz");
  await expect(page.getByText("Pick your track")).toBeVisible();

  await page.goto("/assessment");
  await expect(page.getByText("Pick your track")).toBeVisible();
});

test("a selected track persists across navigation and shows as a read-only badge in the header", async ({
  page,
}) => {
  await selectTrack(page, "Network Security");
  await page.goto("/quiz");
  await expect(page.getByText("Network Security", { exact: true })).toBeVisible();
  // No instant-switch dropdown anymore — the header shows a read-only badge.
  await expect(page.locator("header select")).toHaveCount(0);
});

test("changing track via the header sends you back to the picker, un-gating tool pages until you choose again", async ({
  page,
}) => {
  await selectTrack(page, "VAPT");
  await page.goto("/quiz");

  await page.click('header button:has-text("Change")');
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Step 1 — pick your track")).toBeVisible();

  await page.goto("/screen");
  await expect(page.getByText("Pick your track")).toBeVisible();
});

test("Find Your Path's questionnaire recommends a track and lets you confirm it", async ({ page }) => {
  await page.goto("/find-your-path");
  await page.click('button:has-text("Answer a few questions")');

  const questions = page.locator("fieldset");
  const count = await questions.count();
  expect(count).toBeGreaterThanOrEqual(5);

  for (let i = 0; i < count; i++) {
    await questions.nth(i).locator('input[type="radio"]').first().check();
  }

  await page.click('button:has-text("See my recommendation")');
  await expect(page.getByText("Recommended track")).toBeVisible();

  await page.click('button:has-text("Use this track")');
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Your track:")).toBeVisible();
});

test("Find Your Path's CV-based flow scores against all four tracks and recommends one, no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/find-your-path");
  await page.click('button:has-text("I have a CV ready")');
  await page.setInputFiles('input[type="file"]', path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button:has-text("Find my best-fit track")');

  await expect(page.getByText("Recommended track")).toBeVisible({ timeout: 15_000 });
  expect(consoleErrors).toEqual([]);
});

test("the roadmap page shows an empty state until a tool has been used this session", async ({ page }) => {
  await selectTrack(page);
  await page.goto("/roadmap");
  await expect(page.getByText("No results yet this session")).toBeVisible();
});
