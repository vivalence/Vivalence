import { vitePreprocess } from "@sveltejs/kit/vite";
import preprocess from "svelte-preprocess";

import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        alias: {
            $houdini: "./$houdini"
        }
    },

    preprocess: [
        vitePreprocess({})
        // preprocess({
        // postcss: true
        // })
    ]
};

export default config;
