import { test, expect } from "@playwright/test";
import path from "node:path";

test("homepage is an independent-tools hub with a role picker and no forced CV-first flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "GetHired" })).toBeVisible();
  await expect(page.getByText("Step 1 — pick your track")).toBeVisible();

  // All four tools are directly reachable from the hub, not gated behind CV screening.
  await expect(page.locator('a[href="/screen"]').first()).toBeVisible();
  await expect(page.locator('a[href="/assessment"]').first()).toBeVisible();
  await expect(page.locator('a[href="/quiz"]').first()).toBeVisible();
  await expect(page.locator('a[href="/roadmap"]').first()).toBeVisible();
});

test("picking a role on the homepage persists across navigation via the header selector", async ({ page }) => {
  await page.goto("/");
  await page.click('button:has-text("SOC Analyst")');

  await page.goto("/quiz");
  await expect(page.locator("header select")).toHaveValue("soc_analyst");
});

test("switching role after screening a CV re-scores instantly without re-uploading, no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/screen");
  await page.setInputFiles("#cv-file", path.join(__dirname, "fixtures/sample-cv.pdf"));
  await page.click('button[type="submit"]');
  await expect(page.getByText("Overall match")).toBeVisible({ timeout: 15_000 });

  const initialScore = await page.locator("text=/^\\d+%$/").first().textContent();

  await page.selectOption("header select", "network_security_engineer");
  await expect(page.getByText("network security engineer")).toBeVisible();

  // No new network request to /api/screen should have fired for the switch.
  let screenRequests = 0;
  page.on("request", (req) => {
    if (req.url().includes("/api/screen")) screenRequests += 1;
  });
  await page.selectOption("header select", "vapt");
  await page.waitForTimeout(300);
  expect(screenRequests).toBe(0);

  const switchedScore = await page.locator("text=/^\\d+%$/").first().textContent();
  // Scores are allowed to be equal by chance, but the mechanism must not error out.
  expect(initialScore).toBeTruthy();
  expect(switchedScore).toBeTruthy();
  expect(consoleErrors).toEqual([]);
});

test("the practical assessment is directly reachable without screening a CV first", async ({ page }) => {
  await page.goto("/assessment");
  await expect(page.getByText("Start the practical assessment")).toBeVisible();
});

test("the roadmap page shows an empty state until a tool has been used this session", async ({ page }) => {
  await page.goto("/roadmap");
  await expect(page.getByText("No results yet this session")).toBeVisible();
});
