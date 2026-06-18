import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL ?? "http://127.0.0.1:4329/";

const phaseClasses = [
  "is-loading",
  "is-powering-on",
  "is-atom-revealing",
  "is-title-sequencing",
  "is-title-glowing",
  "is-divider-building",
  "is-divider-opening",
  "is-major-glitching",
  "is-restoring",
  "is-final-glow",
  "is-stable",
  "is-shutting-down",
  "is-powered-off",
];

async function heroState(page) {
  return page.evaluate((classes) => {
    const html = document.documentElement;
    const mobile = document.querySelector(".mobile-hero-wrapper");
    const crt = document.querySelector(".desktop-crt-wrapper");
    const crtHero = document.querySelector("[data-crt-hero]");
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return {
      homeHero: html.dataset.homeHero ?? "",
      stored: sessionStorage.getItem("madlabs-home-hero"),
      mobileVisible: visible(mobile),
      crtVisible: visible(crt),
      visibleH1s: [...document.querySelectorAll("h1")].filter(visible).map((el) => el.textContent.trim()),
      crtHeroClasses: crtHero ? classes.filter((className) => crtHero.classList.contains(className)) : [],
      duplicateIds: [...new Set(duplicates)],
      overflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
  }, phaseClasses);
}

async function loadPage(context, viewport, options = {}) {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  if (options.lockHero) {
    await page.addInitScript((hero) => {
      sessionStorage.setItem("madlabs-home-hero", hero);
    }, options.lockHero);
  }
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  return page;
}

const browser = await chromium.launch({ headless: true });

try {
  {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForFunction(() => document.styleSheets.length > 0);
    const state = await page.evaluate(() => {
      const visible = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      return {
        mobileVisible: visible(".mobile-hero-wrapper"),
        crtVisible: visible(".desktop-crt-wrapper"),
      };
    });
    assert.equal(state.mobileVisible, true, "JS-disabled fallback should show mobile hero");
    assert.equal(state.crtVisible, false, "JS-disabled fallback should hide CRT hero");
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loadPage(context, { width: 1440, height: 900 });
    const state = await heroState(page);
    assert.equal(state.homeHero, "crt");
    assert.equal(state.stored, "crt");
    assert.equal(state.crtVisible, true);
    assert.equal(state.mobileVisible, false);
    assert.deepEqual(state.duplicateIds, []);
    assert.equal(state.overflowPx, 0);
    assert.equal(state.visibleH1s.length, 1);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await loadPage(context, { width: 390, height: 844 });
    const state = await heroState(page);
    assert.equal(state.homeHero, "mobile");
    assert.equal(state.stored, "mobile");
    assert.equal(state.mobileVisible, true);
    assert.equal(state.crtVisible, false);
    assert.deepEqual(state.crtHeroClasses, [], "CRT state machine should not initialize for mobile selection");
    assert.deepEqual(state.duplicateIds, []);
    assert.equal(state.overflowPx, 0);
    assert.deepEqual(state.visibleH1s, ["MAD LABS"]);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await loadPage(context, { width: 1440, height: 900 });
    await page.setViewportSize({ width: 390, height: 844 });
    const state = await heroState(page);
    assert.equal(state.homeHero, "crt", "desktop selection should remain CRT after resize");
    assert.equal(state.crtVisible, true);
    assert.equal(state.mobileVisible, false);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await loadPage(context, { width: 390, height: 844 });
    await page.setViewportSize({ width: 844, height: 390 });
    const state = await heroState(page);
    assert.equal(state.homeHero, "mobile", "phone selection should remain mobile after rotation");
    assert.equal(state.mobileVisible, true);
    assert.equal(state.crtVisible, false);
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await loadPage(context, { width: 1440, height: 900 });
    const state = await heroState(page);
    assert.equal(state.homeHero, "mobile");
    assert.equal(state.mobileVisible, true);
    assert.equal(state.crtVisible, false);
    await context.close();
  }

  {
    const sweepCases = [
      { width: 360, height: 800, expected: "mobile" },
      { width: 390, height: 844, expected: "mobile" },
      { width: 430, height: 932, expected: "mobile" },
      { width: 640, height: 900, expected: "mobile" },
      { width: 767, height: 900, expected: "mobile" },
      { width: 768, height: 1024, expected: "crt" },
      { width: 820, height: 1180, expected: "crt" },
      { width: 1024, height: 768, expected: "crt" },
      { width: 1180, height: 820, expected: "crt" },
      { width: 1280, height: 720, expected: "mobile" },
      { width: 1366, height: 768, expected: "crt" },
      { width: 1440, height: 900, expected: "crt" },
      { width: 1536, height: 864, expected: "crt" },
      { width: 1920, height: 1080, expected: "crt" },
    ];

    for (const viewport of sweepCases) {
      const context = await browser.newContext({ viewport });
      const page = await loadPage(context, viewport);
      const state = await heroState(page);
      assert.equal(state.homeHero, viewport.expected, `${viewport.width}x${viewport.height} should select ${viewport.expected}`);
      assert.equal(state.mobileVisible, viewport.expected === "mobile", `${viewport.width}x${viewport.height} mobile visibility`);
      assert.equal(state.crtVisible, viewport.expected === "crt", `${viewport.width}x${viewport.height} CRT visibility`);
      assert.equal(state.overflowPx, 0, `${viewport.width}x${viewport.height} should not horizontally overflow`);
      assert.equal(state.visibleH1s.length, 1, `${viewport.width}x${viewport.height} should expose one visible h1`);
      assert.deepEqual(state.duplicateIds, [], `${viewport.width}x${viewport.height} should not duplicate SVG IDs`);
      if (viewport.expected === "mobile") {
        assert.deepEqual(state.crtHeroClasses, [], `${viewport.width}x${viewport.height} should keep CRT state machine inert`);
      }
      await context.close();
    }
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const locked = await loadPage(context, { width: 1440, height: 900 });
    await locked.evaluate(() => sessionStorage.setItem("madlabs-home-hero", "mobile"));
    await locked.reload({ waitUntil: "networkidle" });
    let state = await heroState(locked);
    assert.equal(state.homeHero, "mobile", "session lock should be honored on reload");

    await locked.evaluate(() => sessionStorage.removeItem("madlabs-home-hero"));
    await locked.reload({ waitUntil: "networkidle" });
    state = await heroState(locked);
    assert.equal(state.homeHero, "crt", "clearing session storage should allow reclassification");
    await context.close();
  }

  console.log("home hero policy browser checks passed");
} finally {
  await browser.close();
}
