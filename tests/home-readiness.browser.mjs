/* global console, process */

import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const url = process.env.HOME_READINESS_URL || "http://127.0.0.1:4322/";
const screenshotDir = "artifacts/home-readiness";

mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of [
  { name: "desktop", width: 1440, height: 1100, reducedMotion: "no-preference" },
  { name: "mobile", width: 390, height: 844, reducedMotion: "no-preference" },
  { name: "reduced-motion", width: 390, height: 844, reducedMotion: "reduce" },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: viewport.reducedMotion,
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({
    path: `${screenshotDir}/${viewport.name}.png`,
    fullPage: false,
  });

  const title = await page.title();
  const visibleH1Count = await page.locator("h1:visible").count();
  const contactLinkCount = await page.locator("a[href='/contact/']").count();

  await page.keyboard.press("Tab");
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName ?? "");

  results.push({
    ...viewport,
    status: response?.status(),
    title,
    visibleH1Count,
    contactLinkCount,
    focusedTag,
    consoleErrors,
  });

  await context.close();
}

await browser.close();

for (const result of results) {
  assert.equal(result.status, 200, `${result.name} should load from production preview`);
  assert.match(result.title, /Mobile Computer Repair, Tech Support .* Cincinnati .* MAD LABS/);
  assert.equal(result.visibleH1Count, 1, `${result.name} should expose one visible H1`);
  assert.ok(result.contactLinkCount > 0, `${result.name} should expose crawlable contact links`);
  assert.deepEqual(result.consoleErrors, [], `${result.name} should not log console errors`);
}

assert.notEqual(results[0]?.focusedTag, "", "desktop keyboard tab should move focus");

console.log(JSON.stringify(results, null, 2));
