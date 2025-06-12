import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(/get started by editing/i)).toBeVisible();

  await expect(page).toHaveScreenshot({
    threshold: 0.2,
    maxDiffPixels: 100,
  });
});
