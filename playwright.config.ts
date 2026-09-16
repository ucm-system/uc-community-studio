import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  use: {
    baseURL: process.env.STUDIO_URL || "http://127.0.0.1:4173/",
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
  },
  webServer: process.env.STUDIO_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 30_000,
      },
  reporter: [["list"], ["json", { outputFile: "artifacts/test-results.json" }]],
});
