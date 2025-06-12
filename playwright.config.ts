import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 1000,
    },
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["github"],
    ["./e2e-tests/custom-visual-reporter.ts"],
  ],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e-tests",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "on-first-failure",
  },
  webServer: {
    command: "pnpm dev",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:3000",
  },
  workers: process.env.CI ? 1 : undefined,
});
