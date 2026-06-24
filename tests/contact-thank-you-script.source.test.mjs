/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "src/pages/contact/thank-you.astro"), "utf8");

assert.equal(
  /\bvar\s+/.test(source),
  false,
  "contact thank-you scripts should use block-scoped declarations",
);

assert.equal(
  /\.innerHTML\s*=/.test(source),
  false,
  "contact thank-you scripts should not inject URL-derived content with innerHTML",
);

console.log("contact thank-you script source checks passed");
