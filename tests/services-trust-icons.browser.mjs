/* global console, document, process, URL */

import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.MAD_LABS_TEST_URL ?? "http://127.0.0.1:4329/";

const browser = await chromium.launch({ headless: true });
const expectedIconShapes = [
  {
    circles: ["7:7:4.5"],
    lines: [],
    paths: ["M10.5 10.5 13.5 13.5", "M5.5 7h1.2l.8-1.5 1.2 3 1-1.5h.8"],
  },
  {
    circles: [],
    lines: [],
    paths: ["M4.5 2.5h5L12.5 5.5v8h-8z", "M9.5 2.5v3h3", "M6 8h5", "M6 10.5h3.5"],
  },
  {
    circles: [],
    lines: [],
    paths: ["M4 4 12 12", "M12 4 4 12"],
  },
  {
    circles: [],
    lines: [],
    paths: [
      "M8 1.8 2.5 4.4v3.2c0 3.9 2.3 6.6 5.5 7.4 3.2-.8 5.5-3.5 5.5-7.4V4.4L8 1.8Z",
      "m6.2 8.1 1.3 1.3 2.7-3",
    ],
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
        glyphBox: (() => {
          const box = svg?.querySelector("g")?.getBBox();
          return box
            ? { x: box.x, y: box.y, width: box.width, height: box.height }
            : { x: 0, y: 0, width: 0, height: 0 };
        })(),
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
    assert.ok(
      icon.glyphBox.y >= 0,
      `icon glyph should not overflow above viewBox: ${JSON.stringify(icon.glyphBox)}`,
    );
    assert.ok(
      icon.glyphBox.y + icon.glyphBox.height <= 16,
      `icon glyph should not clip below viewBox: ${JSON.stringify(icon.glyphBox)}`,
    );
  }

  assert.deepEqual(
    icons.map(({ circles, lines, paths }) => ({ circles, lines, paths })),
    expectedIconShapes,
    "services trust strip should use the approved service-specific icon sequence",
  );

  console.log("services trust icon browser checks passed");
} finally {
  await browser.close();
}
