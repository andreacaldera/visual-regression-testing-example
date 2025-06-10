import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Create Next App/);

  await expect(page).toHaveScreenshot({
    threshold: 0.2,
    maxDiffPixels: 100,
  });
});
