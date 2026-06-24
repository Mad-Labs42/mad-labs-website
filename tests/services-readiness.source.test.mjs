/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const servicesPage = readFileSync(resolve(root, "src/pages/services.astro"), "utf8");
const serviceCard = readFileSync(resolve(root, "src/components/ServiceCard.astro"), "utf8");
const processSteps = readFileSync(resolve(root, "src/components/ProcessSteps.astro"), "utf8");
const baseLayout = readFileSync(resolve(root, "src/layouts/BaseLayout.astro"), "utf8");

assert.ok(
  servicesPage.includes("Every project starts with a clear diagnostic"),
  "services hero should frame diagnostics across repairs, builds, networks, web, and AI work",
);

assert.equal(
  /style=/.test(servicesPage),
  false,
  "services page should not use inline style attributes",
);

assert.equal(
  serviceCard.includes(".service-card:focus-visible"),
  false,
  "non-interactive service cards should not define focus-visible states",
);

assert.ok(
  serviceCard.includes('<div class="summary-frame">'),
  "service descriptions should use the approved inset glass summary frame",
);

assert.equal(
  serviceCard.includes('class="summary-divider"'),
  false,
  "service cards should remove the divider above the framed summary",
);

assert.equal(
  serviceCard.includes('class="bullets-divider"'),
  false,
  "service cards should remove the divider below the framed summary",
);

assert.equal(
  serviceCard.includes("border-left: 1px solid rgba(232, 144, 80, 0.1)"),
  false,
  "service summaries should not retain the old standalone left rule",
);

assert.ok(
  serviceCard.includes("inset 3px 0 0 rgba(232, 144, 80, 0.22)"),
  "inset glass summary frame should retain the approved restrained side accent",
);

assert.ok(
  processSteps.includes('aria-labelledby="process-heading"'),
  "process section should label the How It Works region",
);

assert.ok(
  processSteps.includes("@media (prefers-reduced-motion: reduce)"),
  "process section should explicitly respect reduced motion",
);

assert.ok(
  /<div class="lab-section-inner-wide">\s*<ProcessSteps \/>/.test(servicesPage),
  "How It Works should use the wide section container for four proportionate cards",
);

for (const icon of ["stethoscope", "check", "rocket", "shield-check"]) {
  assert.ok(
    processSteps.includes(`icon: "${icon}"`),
    `How It Works should define the approved ${icon} icon`,
  );
}

assert.ok(
  processSteps.includes('viewBox="0 0 28 28"'),
  "all process icons should share the service-card 28px icon coordinate system",
);

assert.ok(
  processSteps.includes('stroke-width="1.5"'),
  "all process icons should share the service-card icon stroke weight",
);

assert.ok(
  processSteps.includes(
    `stethoscope:
    '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 4h4"/><path d="M16 4h4"/><path d="M12 16v3a5 5 0 0 0 10 0"/><circle cx="22" cy="22" r="3"/>'`,
  ),
  "stethoscope should use the approved open-earpiece silhouette with a lower chest piece",
);

assert.ok(
  processSteps.includes(`check: '<path d="m5 14 5.5 5.5L23 7" stroke-width="1.725"/>'`),
  "approval checkmark should be exactly 15% thicker than the shared 1.5 stroke",
);

assert.equal(
  processSteps.includes("step-number"),
  false,
  "approval-gate cards should use icons instead of visible step numbers",
);

assert.ok(
  processSteps.includes('class="process-chassis"'),
  "How It Works should use the approved CRT gate-card chassis",
);

const expectedServiceSchemaNames = [
  "Computer repair and tune-ups",
  "Small business websites",
  "Wi-Fi, network and device setup",
  "Hardware upgrades and custom PCs",
  "Security and backup",
  "Custom agents and local AI setup",
];

for (const name of expectedServiceSchemaNames) {
  assert.ok(baseLayout.includes(`name: "${name}"`), `services JSON-LD should include ${name}`);
}

console.log("services readiness source checks passed");
