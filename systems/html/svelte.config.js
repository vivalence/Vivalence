import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import paladin from "@vivalence/paladin";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    dev: true,
    hydratable: true,
  },
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    // vite: { logLevel: "info" },
    // prerender: {
    //   entries: [],
    // },
  },
};

export default config;
