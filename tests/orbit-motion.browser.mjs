import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL ?? "http://127.0.0.1:4322/";
const browser = await chromium.launch({ headless: true });

async function check(page, reduced) {
  const read = () =>
    page.evaluate(() => {
      const root = document.querySelector(
        document.documentElement.dataset.homeHero === "crt"
          ? ".desktop-crt-wrapper"
          : ".mobile-hero-wrapper",
      );
      return [...root.querySelectorAll(".atom-orbit-highlight")].map((pill) => ({
        display: getComputedStyle(pill).display,
        offset: Number.parseFloat(getComputedStyle(pill).strokeDashoffset),
        rects: pill.getClientRects().length,
        animations: pill.getAnimations().map((animation) => animation.animationName),
      }));
    });
  const before = await read();
  assert.equal(before.length, 3);
  if (reduced) {
    for (const pill of before) {
      assert.equal(pill.display, "none", "reduced motion must hide every orbit pill");
      assert.equal(pill.rects, 0);
      assert.deepEqual(pill.animations, []);
    }
  } else {
    await page.waitForTimeout(300);
    const after = await read();
    for (const [index, pill] of after.entries()) {
      assert.ok(pill.animations.includes("atomOrbitGlowFlow"));
      assert.notEqual(pill.offset, before[index].offset, "pill must move along its ellipse");
    }
  }
}

try {
  for (const width of [375, 390, 430, 640, 767, 844, 1440]) {
    for (const reduced of [false, true]) {
      if (width === 1440 && !reduced) continue;
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      if (width === 844 && !reduced) {
        await page.addInitScript(() => sessionStorage.setItem("madlabs-home-hero", "mobile"));
      }
      const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await check(page, reduced);
      if (width === 390 && !reduced) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await check(page, true);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await check(page, false);
      }
      if (width === 1440) {
        await page.evaluate(() => sessionStorage.setItem("madlabs-home-hero", "crt"));
        await page.reload({ waitUntil: "networkidle" });
        await check(page, true);
      }
      assert.deepEqual(errors, []);
      console.log(`ok ${width}px ${reduced ? "reduced" : "normal"} motion`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
