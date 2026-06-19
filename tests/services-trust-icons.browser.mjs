/* global console, document, process, URL */

import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL ?? "http://127.0.0.1:4329/";

const browser = await chromium.launch({ headless: true });
const expectedIconShapes = [
  { circles: ["8:8:6"], lines: [], paths: ["M8 5v3.5l2 1.5"] },
  { circles: [], lines: [], paths: ["M4 8.5 6.5 11 12 5.5"] },
  { circles: [], lines: ["3:8:13:8"], paths: [] },
  {
    circles: [],
    lines: [],
    paths: ["M8 2.5 2 5.5v3c0 4.2 2.5 7.5 6 8.5 3.5-1 6-4.3 6-8.5v-3L8 2.5Z", "m6 8 1.5 1.5 3-3"],
  },
];

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
        circles: [...(svg?.querySelectorAll("circle") ?? [])].map(
          (circle) =>
            `${circle.getAttribute("cx")}:${circle.getAttribute("cy")}:${circle.getAttribute("r")}`,
        ),
        lines: [...(svg?.querySelectorAll("line") ?? [])].map(
          (line) =>
            `${line.getAttribute("x1")}:${line.getAttribute("y1")}:${line.getAttribute("x2")}:${line.getAttribute("y2")}`,
        ),
        paths: [...(svg?.querySelectorAll("path") ?? [])].map((path) => path.getAttribute("d")),
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

  assert.deepEqual(
    icons.map(({ circles, lines, paths }) => ({ circles, lines, paths })),
    expectedIconShapes,
    "services trust strip should preserve the original distinct icon sequence",
  );

  console.log("services trust icon browser checks passed");
} finally {
  await browser.close();
}
