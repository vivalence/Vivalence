import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    dev: true,
    hydratable: true,
  },
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({ fallback: "200.html" }),

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
