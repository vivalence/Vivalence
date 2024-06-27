// import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
// import adapter from "@sveltejs/adapter-node";

import adapter from "svelte-adapter-bun";
import { vitePreprocess } from "@sveltejs/kit/vite";

/* @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [vitePreprocess({})],
    kit: {
        adapter: adapter(),
        alias: {
            $games: "./src/games",
            $global: "./src/global",
            $components: "./src/components",
            $api: "./src/routes/api",
            $classifier: "./src/routes/api/classifier",

            $kit: "./src/kit"
            // $lib: "./src/library"
        }
    }
};

export default config;
