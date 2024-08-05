// https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src

import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
// import path from "path";

import "svelte";
import "@sveltejs/kit";
import "@sveltejs/vite-plugin-svelte";
import {fromFileUrl, dirname, join} from "$std/path/mod.ts"

const root = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      $lib: join(root, './src/lib'),
      $components: join(root, './src/components'),
      $signals: join(root, './src/lib/signals'),
      '$signals/ui': join(root, './src/lib/signals/ui/index.js'),
      '$signals/keyboard': join(root, './src/lib/signals/keyboard/index.js'),
    },
  },
  server: {
    fs: {
      allow: ["../../.."],
    },
  },
  plugins: [sveltekit()],
});
