/* global console, process */

import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL || "http://127.0.0.1:4322";
const screenshotDir = "artifacts/launch-readiness";

mkdirSync(screenshotDir, { recursive: true });

const routes = [
  {
    path: "/",
    title: /Mobile Computer Repair, Tech Support .* Cincinnati .* MAD LABS/,
    noindex: false,
  },
  { path: "/about/", title: /About .* MAD LABS/, noindex: false },
  {
    path: "/services/",
    title: /Cincinnati IT Services, Computer Repair .* MAD LABS/,
    noindex: false,
  },
  { path: "/contact/", title: /Book Computer Repair in Cincinnati .* MAD LABS/, noindex: false },
  { path: "/privacy/", title: /Privacy Policy .* MAD LABS/, noindex: false },
  { path: "/contact/thank-you/", title: /Thank You .* MAD LABS/, noindex: true },
];

const viewports = [
  { name: "mobile", width: 390, height: 844, reducedMotion: "no-preference" },
  { name: "tablet", width: 768, height: 1024, reducedMotion: "no-preference" },
  { name: "desktop", width: 1280, height: 960, reducedMotion: "no-preference" },
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: viewport.reducedMotion,
    });

    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const response = await page.goto(new URL(route.path, baseUrl).toString(), {
        waitUntil: "networkidle",
        timeout: 45000,
      });

      await page.screenshot({
        path: `${screenshotDir}/${viewport.name}-${route.path.replaceAll("/", "_") || "home"}.png`,
        fullPage: false,
      });

      const visibleH1Count = await page.locator("h1:visible").count();
      const canonical = await page.locator("link[rel='canonical']").getAttribute("href");
      const robotsLocator = page.locator("meta[name='robots']");
      const robots =
        (await robotsLocator.count()) > 0 ? await robotsLocator.getAttribute("content") : null;
      const hasJsonLd = (await page.locator('script[type="application/ld+json"]').count()) > 0;

      await page.keyboard.press("Tab");
      const activeElement = await page.evaluate(() => ({
        tagName: document.activeElement?.tagName ?? "",
        isSkipLink: document.activeElement?.hasAttribute("data-skip-link") ?? false,
      }));

      results.push({
        viewport: viewport.name,
        route: route.path,
        status: response?.status(),
        title: await page.title(),
        visibleH1Count,
        canonical,
        robots,
        hasJsonLd,
        activeElement,
        consoleErrors,
      });

      assert.equal(response?.status(), 200, `${route.path} should load for ${viewport.name}`);
      assert.match(await page.title(), route.title, `${route.path} title should stay correct`);
      assert.equal(visibleH1Count, 1, `${route.path} should expose one visible H1`);
      assert.equal(
        canonical,
        `https://madlabs.rocks${route.path}`,
        `${route.path} should keep a canonical`,
      );
      assert.equal(
        route.noindex ? robots : (robots ?? ""),
        route.noindex ? "noindex, nofollow" : "",
        `${route.path} robots state should be correct`,
      );
      if (route.path !== "/privacy/" && route.path !== "/contact/thank-you/") {
        assert.equal(hasJsonLd, true, `${route.path} should expose JSON-LD`);
      }
      assert.deepEqual(
        consoleErrors,
        [],
        `${route.path} should not emit console errors for ${viewport.name}`,
      );
      assert.notEqual(
        activeElement.tagName,
        "",
        `${route.path} should allow keyboard focus entry on ${viewport.name}`,
      );

      if (route.path === "/contact/") {
        await page.waitForSelector("#inline-container iframe", { timeout: 30000 });

        const tabletRegion = page.locator("[data-tablet-root]");
        const iframe = page.locator("#inline-container iframe");

        assert.equal(
          await tabletRegion.getAttribute("aria-describedby"),
          "contact-tablet-instructions",
        );
        assert.equal(
          await iframe.getAttribute("title"),
          "Book a free 20-minute tech call with MAD LABS",
          "contact booking iframe should have a meaningful title",
        );
        assert.equal(
          await page.locator("form[action*='WebToCase']").count(),
          0,
          "dormant ticket forms should not render on the launch contact page",
        );
        assert.equal(
          await page.locator("[data-tablet-root]").count(),
          1,
          "launch contact page should render one active booking region",
        );
      }

      await page.close();
    }

    await context.close();
  }

  const reducedMotionContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const reducedMotionPage = await reducedMotionContext.newPage();
  const reducedMotionErrors = [];
  reducedMotionPage.on("console", (msg) => {
    if (msg.type() === "error") reducedMotionErrors.push(msg.text());
  });
  const reducedMotionResponse = await reducedMotionPage.goto(
    new URL("/contact/", baseUrl).toString(),
    {
      waitUntil: "networkidle",
      timeout: 45000,
    },
  );
  await reducedMotionPage.waitForSelector("#inline-container iframe", { timeout: 30000 });
  assert.equal(
    reducedMotionResponse?.status(),
    200,
    "contact page should load with reduced motion",
  );
  assert.deepEqual(
    reducedMotionErrors,
    [],
    "contact page should not emit console errors with reduced motion",
  );
  await reducedMotionContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
