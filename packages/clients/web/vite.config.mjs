import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltekit } from "@sveltejs/kit/vite";
import { fromFileUrl, dirname, join } from "$std/path/mod.ts";

// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
import "svelte";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";
import "@supabase/ssr";
import "@supabase/supabase-js";
import "@tailwindcss/typography";
import "daisyui";
import "three";
import "mitt";

import "troika-three-text";
import "@threejs-kit/instanced-sprite-mesh";
import "three-mesh-bvh";
import "three-perf";
import "@dimforge/rapier3d-compat";
import "@dimforge/rapier2d-compat";

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: join(root, "./src/lib"),
      $components: join(root, "./src/components"),

      "$trajectory/": join(root, "./src/components/trajectory/"),
      $trajectory: join(root, "./src/components/trajectory/index.js"),

      $instructions: join(root, "./src/components/instructions/Instructions.svelte"),

      "@vivalence/ui": join(root, "../../interfaces/display/mod.js"),
      "@vivalence/shared": join(root, "../../shared/client.js"),
      "@threlte/core": join(root, "../../vendor/threlte/packages/core/src/lib/index.ts"),
      "@threlte/extras": join(root, "../../vendor/threlte/packages/extras/src/lib/index.ts"),
      "@threlte/rapier": join(root, "../../vendor/threlte/packages/rapier/src/lib/index.ts"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".svelte"],
  },
  server: { fs: { allow: ["../../.."] } },
  plugins: [sveltekit()],
});
