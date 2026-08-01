import { test, expect } from "@playwright/test";
import path from "node:path";
import { selectTrack } from "./helpers";

test("uploading a CV renders a scored results view with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await selectTrack(page);
  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');

  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Section 1 — What's good")).toBeVisible();
  await expect(page.getByText("Section 2 — Category coverage")).toBeVisible();
  await expect(page.getByText("Section 3 — Concrete suggestions")).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("results view is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await selectTrack(page);
  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');

  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
});
