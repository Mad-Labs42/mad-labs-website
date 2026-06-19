/* global console, document, process, URL */

import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL ?? "http://127.0.0.1:4329/";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(new URL("/services/", baseUrl).toString(), { waitUntil: "networkidle" });

  const icons = await page.evaluate(() =>
    [...document.querySelectorAll(".trust-strip .trust-icon")].map((icon) => {
      const svg = icon.querySelector("svg");
      const iconRect = icon.getBoundingClientRect();
      const svgRect = svg?.getBoundingClientRect();

      return {
        iconWidth: iconRect.width,
        iconHeight: iconRect.height,
        svgWidth: svgRect?.width ?? 0,
        svgHeight: svgRect?.height ?? 0,
        glyphCount: svg?.querySelectorAll("path,circle,line").length ?? 0,
      };
    }),
  );

  assert.equal(icons.length, 4, "services trust strip should render four icons");

  for (const icon of icons) {
    assert.ok(
      icon.iconWidth >= 12,
      `icon wrapper should have visible width, got ${icon.iconWidth}`,
    );
    assert.ok(
      icon.iconHeight >= 12,
      `icon wrapper should have visible height, got ${icon.iconHeight}`,
    );
    assert.ok(icon.svgWidth >= 12, `icon svg should have visible width, got ${icon.svgWidth}`);
    assert.ok(icon.svgHeight >= 12, `icon svg should have visible height, got ${icon.svgHeight}`);
    assert.ok(icon.glyphCount >= 1, "icon svg should contain at least one glyph");
  }

  console.log("services trust icon browser checks passed");
} finally {
  await browser.close();
}
