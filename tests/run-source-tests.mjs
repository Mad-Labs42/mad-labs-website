/* global console, process */

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const testsDir = resolve(process.cwd(), "tests");
const sourceTests = readdirSync(testsDir)
  .filter((file) => file.endsWith(".source.test.mjs"))
  .sort();

for (const file of sourceTests) {
  const testPath = resolve(testsDir, file);
  console.log(`\n## ${file}`);
  const result = spawnSync(process.execPath, [testPath], { stdio: "inherit" });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`\n${sourceTests.length} source test files passed`);
