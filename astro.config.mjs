import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { writeFileSync } from "fs";
import { resolve } from "path";

function customRobots() {
  return {
    name: "custom-robots",
    hooks: {
      "astro:build:done": ({ dir }) => {
        const out = resolve(dir.pathname || String(dir));

        writeFileSync(
          resolve(out, "robots.txt"),
          [
            "User-agent: *",
            "Allow: /",
            "Disallow: /about/admin/",
            "",
            "Sitemap: https://madlabs.rocks/sitemap-index.xml",
            "",
          ].join("\n"),
        );
      },
    },
  };
}

export default defineConfig({
  site: "https://madlabs.rocks",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/contact/thank-you/"),
    }),
    customRobots(),
  ],
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
