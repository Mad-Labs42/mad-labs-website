/* global console, process */

import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL || "http://127.0.0.1:4322";
const strict = process.env.MAD_LABS_ANIMATION_SMOKE_STRICT === "1";
const artifactDir = "artifacts/performance-jank-p0";
const reportPath = `${artifactDir}/animation-smoke.json`;

mkdirSync(artifactDir, { recursive: true });

const cases = [
  { route: "/", name: "home-mobile", width: 390, height: 844, reducedMotion: "no-preference" },
  { route: "/", name: "home-desktop", width: 1280, height: 900, reducedMotion: "no-preference" },
  { route: "/", name: "home-reduced", width: 1280, height: 900, reducedMotion: "reduce" },
  {
    route: "/contact/",
    name: "contact-mobile",
    width: 390,
    height: 844,
    reducedMotion: "no-preference",
  },
  {
    route: "/contact/",
    name: "contact-desktop",
    width: 1280,
    height: 900,
    reducedMotion: "no-preference",
  },
  {
    route: "/services/",
    name: "services-mobile",
    width: 390,
    height: 844,
    reducedMotion: "no-preference",
  },
  {
    route: "/services/",
    name: "services-desktop",
    width: 1280,
    height: 900,
    reducedMotion: "no-preference",
  },
];

function routeUrl(path) {
  return new URL(path, baseUrl).toString();
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.width, height: testCase.height },
      reducedMotion: testCase.reducedMotion,
    });
    const page = await context.newPage();

    const response = await page.goto(routeUrl(testCase.route), {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    assert.equal(response?.status(), 200, `${testCase.name} should load`);
    await page.waitForTimeout(500);

    const summary = await page.evaluate(() => {
      const isVisible = (el) => {
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

      const declaredAnimationsIn = (selector) => {
        const root = document.querySelector(selector);
        if (!root) return [];
        return [...root.querySelectorAll("*")]
          .map((el) => {
            const style = getComputedStyle(el);
            const names = style.animationName
              .split(",")
              .map((name) => name.trim())
              .filter((name) => name && name !== "none");
            if (names.length === 0) return null;
            return {
              selector,
              tag: el.tagName.toLowerCase(),
              className: typeof el.className === "string" ? el.className : "",
              animationName: names.join(", "),
              display: style.display,
              visibility: style.visibility,
            };
          })
          .filter(Boolean);
      };

      const activeAnimations = document.getAnimations({ subtree: true }).map((animation) => {
        const effect = animation.effect;
        const target = effect && "target" in effect ? effect.target : null;
        const targetElement = target instanceof Element ? target : null;
        return {
          animationName: animation.animationName || "",
          playState: animation.playState,
          currentTime:
            typeof animation.currentTime === "number" ? Math.round(animation.currentTime) : null,
          target: targetElement
            ? {
                tag: targetElement.tagName.toLowerCase(),
                className:
                  typeof targetElement.className === "string" ? targetElement.className : "",
                visible: isVisible(targetElement),
              }
            : null,
        };
      });

      const hiddenHeroWork = [];
      const mobileWrapper = document.querySelector(".mobile-hero-wrapper");
      const desktopWrapper = document.querySelector(".desktop-crt-wrapper");
      if (mobileWrapper && !isVisible(mobileWrapper)) {
        hiddenHeroWork.push(...declaredAnimationsIn(".mobile-hero-wrapper"));
      }
      if (desktopWrapper && !isVisible(desktopWrapper)) {
        hiddenHeroWork.push(...declaredAnimationsIn(".desktop-crt-wrapper"));
      }

      return {
        homeHero: document.documentElement.dataset.homeHero || null,
        overflowPx: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
        activeAnimationCount: activeAnimations.length,
        activeAnimations: activeAnimations.slice(0, 80),
        hiddenHeroAnimationCount: hiddenHeroWork.length,
        hiddenHeroAnimations: hiddenHeroWork.slice(0, 80),
      };
    });

    results.push({ ...testCase, ...summary });
    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
console.log(`Wrote ${reportPath}`);
console.log(JSON.stringify(results, null, 2));

if (strict) {
  const hiddenHeroFailures = results.filter((result) => result.hiddenHeroAnimationCount > 0);
  assert.deepEqual(
    hiddenHeroFailures.map((result) => ({
      name: result.name,
      hiddenHeroAnimationCount: result.hiddenHeroAnimationCount,
    })),
    [],
    "hidden homepage hero branches should not declare active CSS animations",
  );
}
