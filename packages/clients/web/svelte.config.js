import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    dev: true,
    hydratable: true,
  },
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
  },
};

export default config;
