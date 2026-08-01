import { test, expect } from "@playwright/test";
import path from "node:path";

test("uploading a CV renders a scored results view with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');

  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Recommended next steps")).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("results view is usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');

  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });
});
