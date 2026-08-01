import { test, expect } from "@playwright/test";
import interviewPrepData from "../data/interview-prep.json";
import { selectTrack } from "./helpers";

test("the homepage links to interview prep", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/interview-prep"]').first()).toBeVisible();
});

test("visiting interview prep without a selected track shows the gate prompt, not the content", async ({ page }) => {
  await page.goto("/interview-prep");
  await expect(page.getByText("Pick your track")).toBeVisible();
  await expect(page.getByText("What they’re checking")).toHaveCount(0);
});

test("renders role-specific technical questions, shared behavioral questions, and the framework note with no console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await selectTrack(page, "SOC Analyst");
  await page.goto("/interview-prep");

  const socContent = interviewPrepData.roles.find((r) => r.role === "soc_analyst")!;
  await expect(page.getByText(socContent.technicalQuestions[0].question)).toBeVisible();

  const firstBehavioral = interviewPrepData.behavioralQuestions[0];
  await expect(page.getByText(firstBehavioral.question)).toBeVisible();

  await expect(page.getByText(interviewPrepData.behavioralFramework.name)).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("expanding a question reveals what it's checking for", async ({ page }) => {
  await selectTrack(page, "SOC Analyst");
  await page.goto("/interview-prep");

  const socContent = interviewPrepData.roles.find((r) => r.role === "soc_analyst")!;
  const firstQuestion = socContent.technicalQuestions[0];

  await expect(page.getByText(firstQuestion.whatTheyreChecking)).not.toBeVisible();
  await page.getByText(firstQuestion.question).click();
  await expect(page.getByText(firstQuestion.whatTheyreChecking)).toBeVisible();
});

test("role gating: a different track sees different technical questions", async ({ page }) => {
  await selectTrack(page, "Network Security");
  await page.goto("/interview-prep");

  const netsecContent = interviewPrepData.roles.find((r) => r.role === "network_security_engineer")!;
  const vaptContent = interviewPrepData.roles.find((r) => r.role === "vapt")!;

  await expect(page.getByText(netsecContent.technicalQuestions[0].question)).toBeVisible();
  await expect(page.getByText(vaptContent.technicalQuestions[0].question)).toHaveCount(0);
});
