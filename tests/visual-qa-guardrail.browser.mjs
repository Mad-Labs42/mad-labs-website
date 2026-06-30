/* global console, process */

import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL || "http://127.0.0.1:4322";
const maxOverflowPx = Number(process.env.MAD_LABS_MAX_OVERFLOW_PX ?? 2);
const writeScreenshots = process.env.MAD_LABS_VISUAL_QA_SCREENSHOTS === "1";
const screenshotDir = "artifacts/visual-qa-guardrail";

const routes = [
  { path: "/", expectBrand: true, expectContactEmbed: false, noindex: false },
  { path: "/services/", expectBrand: true, expectContactEmbed: false, noindex: false },
  { path: "/about/", expectBrand: true, expectContactEmbed: false, noindex: false },
  { path: "/contact/", expectBrand: true, expectContactEmbed: true, noindex: false },
  { path: "/privacy/", expectBrand: true, expectContactEmbed: false, noindex: false },
];

const viewports = [
  { name: "mobile", width: 375, height: 812, reducedMotion: "no-preference" },
  { name: "tablet", width: 768, height: 1024, reducedMotion: "no-preference" },
  { name: "desktop", width: 1280, height: 900, reducedMotion: "no-preference" },
];

function routeUrl(path) {
  return new URL(path, baseUrl).toString();
}

function label(viewport, route) {
  return `${viewport.name} ${route.path}`;
}

async function collectPageSignals(page) {
  return page.evaluate(() => {
    const isVisible = (el) => {
      if (!(el instanceof Element)) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const overflowPx = Math.max(
      0,
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    const robotsMeta = document.querySelector("meta[name='robots']");
    const robots = robotsMeta?.getAttribute("content") ?? "";
    const brandVisible = [
      ...document.querySelectorAll("h1, header, nav, [data-crt-hero], .mobile-hero-wrapper"),
    ]
      .filter(isVisible)
      .some((el) => /MAD\s*LABS/i.test(el.textContent ?? ""));

    const runningAnimations = document
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running").length;

    const crtHero = document.querySelector("[data-crt-hero]");
    const mobileHero = document.querySelector(".mobile-hero-wrapper");
    const desktopCrt = document.querySelector(".desktop-crt-wrapper");

    return {
      homeHero: document.documentElement.dataset.homeHero ?? null,
      overflowPx,
      robots,
      brandVisible,
      visibleH1Count: [...document.querySelectorAll("h1")].filter(isVisible).length,
      runningAnimations,
      crtHeroReduced: crtHero?.classList.contains("is-reduced-motion") ?? false,
      crtVisible: isVisible(desktopCrt),
      mobileVisible: isVisible(mobileHero),
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      contactTablet: document.querySelector("[data-tablet-root]") !== null,
      bookingIframe: document.querySelector("#inline-container iframe") !== null,
    };
  });
}

if (writeScreenshots) {
  mkdirSync(screenshotDir, { recursive: true });
}

const browser = await chromium.launch({ headless: true });
const failures = [];

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

      const caseLabel = label(viewport, route);
      let response;
      try {
        response = await page.goto(routeUrl(route.path), {
          waitUntil: "networkidle",
          timeout: 45000,
        });

        assert.equal(response?.status(), 200, `${caseLabel} should return HTTP 200`);
        assert.deepEqual(consoleErrors, [], `${caseLabel} should not log console errors`);

        const signals = await collectPageSignals(page);
        assert.ok(
          signals.overflowPx <= maxOverflowPx,
          `${caseLabel} overflow ${signals.overflowPx}px exceeds ${maxOverflowPx}px`,
        );
        assert.ok(signals.brandVisible, `${caseLabel} should show visible MAD LABS brand/header`);
        assert.equal(signals.visibleH1Count, 1, `${caseLabel} should expose one visible H1`);
        assert.equal(
          signals.robots,
          route.noindex ? "noindex, nofollow" : "",
          `${caseLabel} robots meta should ${route.noindex ? "be noindex" : "not be noindex"}`,
        );

        if (route.expectContactEmbed) {
          await page.waitForSelector("#inline-container iframe", { timeout: 30000 });
          const embedSignals = await collectPageSignals(page);
          assert.equal(
            embedSignals.contactTablet,
            true,
            `${caseLabel} should render contact tablet region`,
          );
          assert.equal(
            embedSignals.bookingIframe,
            true,
            `${caseLabel} should render booking iframe`,
          );
        }

        if (writeScreenshots) {
          const fileName = `${viewport.name}-${route.path.replaceAll("/", "_") || "home"}.png`;
          await page.screenshot({ path: `${screenshotDir}/${fileName}`, fullPage: false });
        }

        console.log(`ok ${caseLabel}`);
      } catch (error) {
        failures.push({ caseLabel, error: error instanceof Error ? error.message : String(error) });
      } finally {
        await page.close();
      }
    }

    await context.close();
  }

  const reducedCases = [
    {
      name: "home-desktop-reduced-motion",
      path: "/",
      width: 1280,
      height: 900,
      assertSignals(signals) {
        assert.equal(
          signals.homeHero,
          "mobile",
          "home should select mobile hero under reduced motion on desktop",
        );
        assert.equal(signals.mobileVisible, true, "mobile hero should be visible");
        assert.equal(signals.crtVisible, false, "CRT hero should stay hidden under reduced motion");
        assert.equal(
          signals.prefersReducedMotion,
          true,
          "browser context should honor prefers-reduced-motion",
        );
      },
    },
    {
      name: "contact-mobile-reduced-motion",
      path: "/contact/",
      width: 375,
      height: 812,
      async assertPage(page) {
        await page.waitForSelector("#inline-container iframe", { timeout: 30000 });
      },
      assertSignals(signals) {
        assert.equal(signals.bookingIframe, true, "contact booking iframe should load");
        assert.equal(signals.contactTablet, true, "contact tablet should render");
      },
    },
  ];

  for (const reducedCase of reducedCases) {
    const context = await browser.newContext({
      viewport: { width: reducedCase.width, height: reducedCase.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    try {
      const response = await page.goto(routeUrl(reducedCase.path), {
        waitUntil: "networkidle",
        timeout: 45000,
      });
      assert.equal(response?.status(), 200, `${reducedCase.name} should return HTTP 200`);
      assert.deepEqual(consoleErrors, [], `${reducedCase.name} should not log console errors`);
      if (reducedCase.assertPage) await reducedCase.assertPage(page);
      const signals = await collectPageSignals(page);
      reducedCase.assertSignals(signals);
      console.log(`ok ${reducedCase.name}`);
    } catch (error) {
      failures.push({
        caseLabel: reducedCase.name,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await page.close();
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error("\nvisual QA guardrail failures:");
  for (const failure of failures) {
    console.error(`- ${failure.caseLabel}: ${failure.error}`);
  }
  process.exit(1);
}

console.log(
  `\nvisual QA guardrail passed (${routes.length} routes × ${viewports.length} viewports + reduced-motion checks)`,
);
