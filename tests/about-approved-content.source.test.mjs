/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const source = readFileSync(resolve(root, "src/pages/about/index.astro"), "utf8");
const compactSource = source.replace(/\s+/g, " ");

const approvedApproachCopy = [
  "Every repair starts with a full diagnostic. We run hardware and software tests to find the root cause — not just treat the symptoms.",
  "We tell you what's wrong, why it matters, and what your options are. No jargon, no upselling, no surprises.",
  "With your approval, we perform the repair using quality components and proven techniques. Every device is tested before it goes home.",
];

for (const copy of approvedApproachCopy) {
  assert.ok(
    compactSource.includes(copy),
    `about approach card should preserve approved copy: ${copy}`,
  );
}

const requiredAboutCopy = [
  "serving Greater Cincinnati by appointment",
  "There is no walk-in storefront or drop-off counter.",
  "WSL-based workflows, local tooling, practical automation, lightweight agents, and websites",
  'href="/services/"',
];

for (const copy of requiredAboutCopy) {
  assert.ok(compactSource.includes(copy), `about page should include updated copy: ${copy}`);
}

const forbiddenAboutCopy = [
  /since 2020/i,
  /IT support team/i,
  /Trusted Computer Repair Experts/i,
  /Mac repair/i,
  /phone repair/i,
  /Linux administration/i,
  /managed IT/i,
];

for (const pattern of forbiddenAboutCopy) {
  assert.doesNotMatch(source, pattern, `about page should not include forbidden copy: ${pattern}`);
}

const approvedTrustGlyphs = [
  'transform="translate(10 10) scale(0.78) translate(-10 -10)"',
  'd="M12.25 5.25a0.83 0.83 0 0 0 0 1.17l1.33 1.33',
  'd="M7 10.5 9 12.5 13 7.5"',
  'd="M10 4.25v11.5"',
  'd="M14.15 5.85H8.15a2.9 2.9 0 1 0 0 5.8h4.15a2.9 2.9 0 1 1 0 5.85H6.15"',
  'd="M10 6v4.5l3 1.5"',
  'x="3" y="7" width="14" height="11" rx="1.5"',
  'd="M6.5 7V5a3.5 3.5 0 0 1 7 0v2"',
];

for (const glyph of approvedTrustGlyphs) {
  assert.ok(source.includes(glyph), `about trust card should include approved glyph: ${glyph}`);
}

assert.equal(
  (source.match(/<MadLabsIcon/g) ?? []).length,
  0,
  "about trust cards should not use the generic MadLabsIcon component",
);

console.log("about approved content source checks passed");
