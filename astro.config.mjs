import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://madlabs.example.com",
  output: "static",
  srcDir: "src",
  publicDir: "public",
  outDir: "dist",
  vite: {
    plugins: [tailwindcss()],
  },
});
