import { test, expect } from "@playwright/test";
import resourcesData from "../data/resources.json";
import { selectTrack } from "./helpers";

test("the homepage links to the resource library", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/resources"]').first()).toBeVisible();
});

test("visiting the resource library without a selected track shows the gate prompt, not the content", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByText("Pick your track")).toBeVisible();
  await expect(page.getByText("Open resource")).toHaveCount(0);
});

test("renders role-filtered resources with a working external link and no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await selectTrack(page, "VAPT");
  await page.goto("/resources");

  const netsecOnlyResource = resourcesData.resources.find((r) => r.id === "netacad-ccna-intro-to-networks")!;
  expect(netsecOnlyResource.roles).not.toContain("vapt");
  await expect(page.getByText(netsecOnlyResource.title)).toHaveCount(0);

  const portswigger = resourcesData.resources.find((r) => r.id === "portswigger-web-security-academy")!;
  const link = page.locator(`a[href="${portswigger.url}"]`).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");

  expect(consoleErrors).toEqual([]);
});

test("category filter narrows the visible resources", async ({ page }) => {
  await selectTrack(page, "Generalist");
  await page.goto("/resources");

  const netacadCcna = resourcesData.resources.find((r) => r.id === "netacad-ccna-intro-to-networks")!;
  await expect(page.getByText(netacadCcna.title)).toHaveCount(0);

  await page.getByRole("button", { name: /^Networking/ }).click();
  const networkChuck = resourcesData.resources.find((r) => r.id === "networkchuck-youtube")!;
  await expect(page.getByText(networkChuck.title)).toBeVisible();
});

test("role gating: network_security_engineer sees a CCNA-track resource that VAPT does not", async ({ page }) => {
  await selectTrack(page, "Network Security");
  await page.goto("/resources");

  const netacadCcna = resourcesData.resources.find((r) => r.id === "netacad-ccna-intro-to-networks")!;
  await expect(page.getByText(netacadCcna.title)).toBeVisible();
});
