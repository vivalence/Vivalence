import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import config from "@vivalence/config";

// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
import "svelte";
import "@sveltejs/kit";

import "tailwindcss";
import "postcss";
import "autoprefixer";
import "@tailwindcss/typography";
import "@sveltejs/vite-plugin-svelte";

// import "dockview-core";
// import "mitt";
// import "three";
// import "tinykeys";

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@client/lib/": join(root, "./src/lib/"),
      "@client/components/": join(root, "./src/components/"),
      "@client/icons/": join(root, "./static/icons/"),
      "@client/context": join(root, "./src/context.js"),

      "@vivalence/interface": join(root, "../../interfaces/display/mod.js"),
      "@vivalence/shared": join(root, "../../shared/client.js"),

      "@threlte/core": join(root, "../../vendor/threlte/packages/core/src/lib/index.ts"),
      "@threlte/extras": join(root, "../../vendor/threlte/packages/extras/src/lib/index.ts"),
      "@threlte/rapier": join(root, "../../vendor/threlte/packages/rapier/src/lib/index.ts"),
    },
    extensions: [".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
    // @lj: .mjs for threejs
  },
  plugins: [sveltekit()],
  server: {
    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/#*/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../../modules/games/**/*.{html,svelte.js,svelte,css}",
        "../../interfaces/display/**/*",
        "../../shared/**/*",
      ],

      // include: ["./src/**/*", "../../../modules/games/**/*.{html,svelte.js,svelte,css}", "../../interfaces/display/**/*", "../../shared/**/*",],
    },
  },
});
