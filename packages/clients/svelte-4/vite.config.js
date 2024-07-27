import { sveltekit } from "@sveltejs/kit/vite";
// import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()]
});

// build: {
//   rollupOptions: {
//     input: { singleComponent: "src/test/Game.svelte" },
//     // input: "src/test/Game.svelte",
//     output: {
//       entryFileNames: "assets/[name].js",
//       chunkFileNames: "assets/[name].js",
//       assetFileNames: "assets/[name].[ext]"
//     }
//   }
// }
