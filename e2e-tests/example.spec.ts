import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Create Next App/);

  await expect(page).toHaveScreenshot({ maxDiffPixels: 200 });
});
