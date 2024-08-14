import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fromFileUrl, dirname, join } from "$std/path/mod.ts";

// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
import "@vivalence/config";
import "svelte";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";
import "@supabase/ssr";
import "@supabase/supabase-js"
import "daisyui";

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: join(root, "./src/lib"),
      $components: join(root, "./src/components"),
      $matrix: join(root, "./src/lib/state/matrix/matrix.js"),
      $signals: join(root, "./src/lib/state/signals"),
    },
  },
  server: { fs: { allow: ["../../.."] } },
  plugins: [sveltekit()],
  // define: JSON.stringify(config.env),
});
