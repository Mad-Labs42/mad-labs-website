/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const homePage = readFileSync(resolve(root, "src/pages/index.astro"), "utf8");

const ctaActionMatch = homePage.match(/\.cta-action\s*\{(?<rules>[^}]+)\}/);
assert.ok(ctaActionMatch?.groups?.rules, "homepage should define final CTA action styles");

const ctaActionRules = ctaActionMatch.groups.rules;

assert.match(
  homePage,
  /<span class="lab-heading-accent">Get Started<\/span>\s*<h2 id="cta-heading">Let MAD LABS tame your tech!<\/h2>\s*<a href="\/contact\/" class="lab-button">Contact MAD LABS<\/a>/,
  "homepage final CTA should keep the requested Get Started, heading, and Contact button together",
);
assert.match(
  ctaActionRules,
  /align-items:\s*center;/,
  "homepage final CTA action should center its children on the inline axis",
);
assert.match(
  ctaActionRules,
  /text-align:\s*center;/,
  "homepage final CTA action should center multiline CTA text",
);

console.log("home CTA alignment source checks passed");
