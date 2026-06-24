/* global console, process */

import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = process.env.PRIVACY_READINESS_URL || "http://127.0.0.1:4322";
const screenshotDir = "artifacts/privacy-readiness";

mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of [
  { name: "desktop", width: 1440, height: 1100, reducedMotion: "no-preference" },
  { name: "mobile", width: 390, height: 844, reducedMotion: "no-preference" },
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

  const response = await page.goto(`${baseUrl}/privacy/`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.screenshot({
    path: `${screenshotDir}/${viewport.name}.png`,
    fullPage: false,
  });

  const title = await page.title();
  const visibleH1Count = await page.locator("h1:visible").count();
  const headings = await page
    .locator("h1, h2")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()).filter(Boolean));
  const footerPrivacyLink = page.locator("footer a[href='/privacy/']");
  const footerPrivacyLinkCount = await footerPrivacyLink.count();
  const publicTodoCount = await page.locator("body").evaluate((body) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let count = 0;
    while (walker.nextNode()) {
      if (walker.currentNode.textContent?.toLowerCase().includes("todo")) count += 1;
    }
    return count;
  });

  await footerPrivacyLink.first().focus();
  const focusVisible = await footerPrivacyLink
    .first()
    .evaluate((link) => link.matches(":focus-visible"));

  results.push({
    ...viewport,
    status: response?.status(),
    title,
    visibleH1Count,
    headings,
    footerPrivacyLinkCount,
    publicTodoCount,
    focusVisible,
    consoleErrors,
  });

  await context.close();
}

await browser.close();

for (const result of results) {
  assert.equal(result.status, 200, `${result.name} privacy page should load`);
  assert.match(result.title, /Privacy Policy .* MAD LABS/);
  assert.equal(result.visibleH1Count, 1, `${result.name} should expose one visible H1`);
  for (const heading of [
    "Your data is not lab fuel.",
    "Privacy-first by default.",
    "What We Collect",
    "What We Don't Do",
    "Microsoft Clarity is launch equipment, not an ad machine.",
    "You choose what to send.",
    "Useful tools, limited blast radius.",
    "Questions, corrections, deletion requests.",
  ]) {
    assert.ok(result.headings.includes(heading), `${result.name} should include ${heading}`);
  }
  assert.equal(result.footerPrivacyLinkCount, 1, `${result.name} footer should link to privacy`);
  assert.equal(result.publicTodoCount, 0, `${result.name} should not expose public TODO text`);
  assert.equal(result.focusVisible, true, `${result.name} footer privacy link should show focus`);
  assert.deepEqual(result.consoleErrors, [], `${result.name} should not log console errors`);
}

console.log(JSON.stringify(results, null, 2));
