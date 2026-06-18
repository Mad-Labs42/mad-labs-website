import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const index = read("src/pages/index.astro");
const baseLayout = read("src/layouts/BaseLayout.astro");
const crtHero = read("src/components/CrtHero.astro");
const crtDivider = read("src/components/CrtDivider.astro");
const crtScreenOverlays = read("src/components/CrtScreenOverlays.astro");
const atomLogo = read("src/components/CrtAtomLogo.astro");
const mobileHero = read("src/components/MobileHomeHero.astro");
const glassNav = read("src/components/MadLabsGlassNav.astro");

assert.match(index, /import\s+MobileHomeHero\s+from\s+["']\.\.\/components\/MobileHomeHero\.astro["'];/);
assert.match(index, /<BaseLayout[^>]*homeHeroClassifier=\{true\}/);
assert.match(index, /class=["']mobile-hero-wrapper["']/);
assert.match(index, /class=["']desktop-crt-wrapper["']/);
assert.match(index, /<MobileHomeHero\s*\/>/);
assert.match(index, /<CrtHero\s*\/>/);

assert.match(baseLayout, /homeHeroClassifier\??:\s*boolean/);
assert.match(baseLayout, /madlabs-home-hero/);
assert.match(baseLayout, /document\.documentElement\.dataset\.homeHero/);
assert.match(baseLayout, /Math\.min\(window\.innerWidth,\s*window\.innerHeight\)/);
assert.match(baseLayout, /shortSide\s*>=\s*768/);
assert.match(baseLayout, /prefers-reduced-motion:\s*reduce/);
assert.doesNotMatch(baseLayout, /addEventListener\(["']resize["']/);
assert.doesNotMatch(baseLayout, /addEventListener\(["']orientationchange["']/);

const guardIndex = crtHero.indexOf('document.documentElement.dataset.homeHero !== "crt"');
const firstQueryIndex = crtHero.indexOf('document.querySelector<HTMLElement>("[data-crt-hero]")');
assert.ok(guardIndex >= 0, "CrtHero must guard mobile-selected sessions");
assert.ok(firstQueryIndex >= 0, "CrtHero selector should still exist");
assert.ok(guardIndex < firstQueryIndex, "CrtHero guard must run before CRT queries and side effects");

const dividerGuardIndex = crtDivider.indexOf('document.documentElement.dataset.homeHero !== "crt"');
const dividerQueryIndex = crtDivider.indexOf('document.querySelector("[data-crt-divider]")');
assert.ok(dividerGuardIndex >= 0, "CrtDivider must guard mobile-selected sessions");
assert.ok(dividerQueryIndex >= 0, "CrtDivider selector should still exist");
assert.ok(dividerGuardIndex < dividerQueryIndex, "CrtDivider guard must run before divider event listeners");

assert.match(atomLogo, /gradientId\s*=\s*"nucleus-grad"/);
assert.match(atomLogo, /<radialGradient\s+id=\{gradientId\}/);
assert.match(atomLogo, /fill=\{`url\(#\$\{gradientId\}\)`\}/);

assert.match(mobileHero, /<MadLabsGlassNav\s+context=["']mobile-hero["']/);
assert.match(mobileHero, /gradientId=["']nucleus-grad-mobile["']/);
assert.match(mobileHero, /class="mobile-hero__glass"/);
assert.match(mobileHero, /class="mobile-energy-field"/);
assert.match(mobileHero, /class="mobile-energy-field__particle mobile-energy-field__particle--cyan"/);
assert.match(mobileHero, /@keyframes\s+mobileHeroEnergyDrift/);
assert.match(mobileHero, /@keyframes\s+mobileHeroCorePulse/);
assert.match(mobileHero, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.mobile-energy-field[\s\S]*animation:\s*none;/);

assert.match(glassNav, /--ml-nav-item-min-height:\s*clamp\(30px,\s*3\.1vw,\s*40px\);/);
assert.match(glassNav, /--ml-nav-icon-size:\s*clamp\(16px,\s*1\.55vw,\s*20px\);/);
assert.match(glassNav, /--ml-nav-label-size:\s*clamp\(0\.78rem,\s*0\.95vw,\s*0\.9rem\);/);
assert.match(glassNav, /\.madlabs-glass-nav\.is-crt-taskbar::after[\s\S]*animation:\s*madlabsCrtTaskbarChase\s+11s\s+linear\s+infinite;/);
assert.match(glassNav, /@keyframes\s+madlabsCrtTaskbarChase[\s\S]*transform:\s*translate3d\(-130%,\s*0,\s*0\)[\s\S]*transform:\s*translate3d\(130%,\s*0,\s*0\)/);
assert.match(glassNav, /rgba\(238,\s*222,\s*255,\s*0\.95\)/);
assert.match(glassNav, /rgba\(168,\s*116,\s*255,\s*0\.72\)/);
assert.doesNotMatch(glassNav, /madlabsCrtTaskbarChase[\s\S]*rgba\(0,\s*240,\s*122/);
assert.match(glassNav, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.madlabs-glass-nav\.is-crt-taskbar::after[\s\S]*animation:\s*none;/);

assert.match(crtHero, /radial-gradient\(\s*ellipse at 50% 42%,\s*rgba\(185, 151, 255, 0\.28\) 0%,\s*rgba\(124, 86, 214, 0\.2\) 34%,\s*transparent 68%\s*\)/);
assert.match(crtHero, /linear-gradient\(\s*180deg,\s*#5c4592 0%,\s*#403073 48%,\s*#2f235c 100%\s*\)/);
assert.match(crtScreenOverlays, /background-image: radial-gradient\(circle, rgba\(235, 224, 255, 0\.045\) 0 0\.75px, transparent 0\.9px\);/);
assert.match(crtScreenOverlays, /background-size: 6px 6px;/);
assert.match(crtScreenOverlays, /\.crt-scanlines\s*\{[\s\S]*?opacity: 0\.34;/);
assert.match(crtScreenOverlays, /:global\(\.is-stable\) \.crt-bands\s*\{[\s\S]*?opacity: 0\.46;/);
assert.match(crtScreenOverlays, /:global\(\.is-stable \.crt-screen\) \.crt-phosphor-dots\s*\{[\s\S]*?opacity: 0\.44;[\s\S]*?filter: none;/);

console.log("home hero policy source checks passed");
