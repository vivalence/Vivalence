import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
import "@supabase/ssr";
import "@supabase/supabase-js";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";
import "@tailwindcss/typography";
import "autoprefixer";
import "postcss";
import "svelte";
import "tailwindcss";

import "@dimforge/rapier2d-compat";
import "@dimforge/rapier3d-compat";
import "@threejs-kit/instanced-sprite-mesh";
import "mitt";
import "three";
import "three-mesh-bvh";
import "three-perf";
import "tinykeys";
import "troika-three-text";

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: join(root, "./src/lib"),
      $components: join(root, "./src/components"),
      $icons: join(root, "./static/icons"),

      "@vivalence/ui": join(root, "../../interfaces/display/mod.js"),
      "@vivalence/shared": join(root, "../../shared/client.js"),

      "@threlte/core": join(root, "../../vendor/threlte/packages/core/src/lib/index.ts"),
      "@threlte/extras": join(root, "../../vendor/threlte/packages/extras/src/lib/index.ts"),
      "@threlte/rapier": join(root, "../../vendor/threlte/packages/rapier/src/lib/index.ts"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".svelte", ".mjs", ".svg"],
  },
  plugins: [sveltekit()],
  server: {
    fs: { allow: ["../../.."] },
    watch: {
      include: [
        "./src/**/*",
        "../../../modules/games/**/*.{html,svelte.js,svelte,css}",
        "../../interfaces/display/**/*",
        "../../shared/**/*",
      ],
    },
  },
});
