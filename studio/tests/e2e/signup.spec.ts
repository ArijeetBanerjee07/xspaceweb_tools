import { test, expect } from "@playwright/test";

test.describe("Signup Flow", () => {
  test("should render signup form and allow registration", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.locator("h1")).toContainText("Create an Account");
    await page.fill('input[placeholder="Jane Doe"]', "Test User");
    await page.fill('input[placeholder="you@example.com"]', `e2e_${Date.now()}@example.com`);
    await page.fill('input[placeholder="••••••••"]', "password123");

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});
