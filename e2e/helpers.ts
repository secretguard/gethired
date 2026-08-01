import type { Page } from "@playwright/test";

/**
 * Every tool page is now gated behind an explicit track selection (V4-P0
 * strict gating) and Playwright gives each test a fresh, unauthenticated
 * browser context, so every test that needs a gated page must select a
 * track first. Defaults to Generalist, matching this helper's most common
 * caller — tests specifically about role-track behavior pass a different
 * short label.
 */
export async function selectTrack(page: Page, shortLabel: string = "Generalist"): Promise<void> {
  await page.goto("/");
  await page.click(`button:has-text("${shortLabel}")`);
}
