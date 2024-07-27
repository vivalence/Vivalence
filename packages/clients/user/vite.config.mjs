// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src

import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

import "svelte";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  server: {
    fs: {
      allow: ["../../.."],
    },
  },
  plugins: [sveltekit()],
});
