import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fromFileUrl, dirname, join } from "$std/path/mod.ts";

// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
// import "@vivalence/config";
// import ui from "@vivalence/ui";
import "svelte";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";
import "@supabase/ssr";
import "@supabase/supabase-js";
import "@tailwindcss/typography";
import "daisyui";

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: join(root, "./src/lib"),
      $components: join(root, "./src/components"),
      "$trajectory/": join(root, "./src/trajectory/"),
      $trajectory: join(root, "./src/trajectory/index.js"),
      "@vivalence/ui": join(root, "../../ui/mod.js"),
    },
  },
  server: { fs: { allow: ["../../.."] } },
  plugins: [sveltekit()],
  // define: JSON.stringify(config.env),
});
