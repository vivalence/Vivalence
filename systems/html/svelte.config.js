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
    files: {
      // assets:"static", hooks, routes, serviceWorker, errorTemplate, routes.
      appTemplate: "src/client.html",
    },
  },
};

export default config;
