import { defineConfig } from '@playwright/test';

// Tests target the built game. Use an installed browser explicitly, or install
// Playwright's Chromium. A missing browser must not be treated as a passing test.
export default defineConfig({
  testDir: 'tests/integration',
  forbidOnly: !!process.env.CI,
  use: {
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      executablePath: process.env.GAME_STUDIO_BROWSER || undefined,
      args: ['--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
    },
  },
});
