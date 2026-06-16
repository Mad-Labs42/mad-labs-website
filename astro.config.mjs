import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

function customSitemap() {
  const today = new Date().toISOString().split("T")[0];
  return {
    name: "custom-sitemap",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const out = resolve(dir.pathname || String(dir));

        const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://madlabs.rocks/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://madlabs.rocks/sitemap-thankyou.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

        const sitemapMain = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://madlabs.rocks/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://madlabs.rocks/services/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://madlabs.rocks/about/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://madlabs.rocks/contact/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

        const sitemapThankyou = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://madlabs.rocks/contact/thank-you/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

        writeFileSync(resolve(out, "sitemap-index.xml"), sitemapIndex);
        writeFileSync(resolve(out, "sitemap-main.xml"), sitemapMain);
        writeFileSync(resolve(out, "sitemap-thankyou.xml"), sitemapThankyou);

        // robots.txt
        writeFileSync(
          resolve(out, "robots.txt"),
          "User-agent: *\nAllow: /\nSitemap: https://madlabs.rocks/sitemap-index.xml\n",
        );
      },
    },
  };
}

export default defineConfig({
  site: "https://madlabs.rocks",
  integrations: [customSitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
        interval: 250,
      },
    },
  },
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
