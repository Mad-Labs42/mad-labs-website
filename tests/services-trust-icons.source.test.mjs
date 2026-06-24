/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const servicesSource = readFileSync(resolve(root, "src/pages/services.astro"), "utf8");
const iconSource = readFileSync(resolve(root, "src/components/MadLabsIcon.astro"), "utf8");

const expectedServicesSequence = [
  { label: "Full diagnostic first", icon: "diagnostic" },
  { label: "Clear quote before work", icon: "quote" },
  { label: "No upsells — just what you need", icon: "no-upsell" },
  { label: "Senior &amp; veteran discount", icon: "discount" },
];

let previousIndex = -1;
for (const { label, icon } of expectedServicesSequence) {
  const iconMarkup = `<MadLabsIcon name="${icon}" />`;
  const iconIndex = servicesSource.indexOf(iconMarkup);
  const labelIndex = servicesSource.indexOf(label);

  assert.notEqual(iconIndex, -1, `services trust strip should use ${iconMarkup}`);
  assert.notEqual(labelIndex, -1, `services trust strip should include label: ${label}`);
  assert.ok(iconIndex > previousIndex, `${icon} icon should appear in approved sequence`);
  assert.ok(labelIndex > iconIndex, `${icon} icon should appear before its label`);
  previousIndex = labelIndex;
}

for (const { icon } of expectedServicesSequence) {
  assert.ok(
    iconSource.includes(`${icon}:`) || iconSource.includes(`"${icon}":`),
    `MadLabsIcon should define a service-specific ${icon} glyph`,
  );
}

assert.ok(
  iconSource.includes('viewBox="0 0 16 16"'),
  "service trust icons should stay in the shared 16px icon system",
);

assert.ok(
  iconSource.includes('"no-upsell": `<path d="M4 4 12 12"/><path d="M12 4 4 12"/>`'),
  "no-upsell trust glyph should be the approved orange X in the shared icon system",
);

console.log("services trust icon source checks passed");
