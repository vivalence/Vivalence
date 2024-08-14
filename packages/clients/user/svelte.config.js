import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: [vitePreprocess({})],
  define: {},
  kit: {
    adapter: adapter(),
  },
};

export default config;
