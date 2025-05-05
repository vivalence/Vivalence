import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@client/shadcn/": join(__dirname, "./src/shadcn/"),
      "@client/lib/": join(__dirname, "./src/lib/"),
      "@client/components/": join(__dirname, "./src/components/"),
      "@client/icons/": join(__dirname, "./static/icons/"),
      "@client/context": join(__dirname, "./src/context.js"),
      "@vivalence/interface": join(
        __dirname,
        "../../interfaces/display/mod.js",
      ),
      "@vivalence/shared": join(__dirname, "../../shared/client.js"),
    },
    extensions: [".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
  },
  plugins: [sveltekit()],
  server: {
    fs: { allow: ["../../.."] },
    watch: {
      usePolling: true,
      ignored: ["**/node_modules/**", "**/#*/**", "**/#*"],
      include: [
        "./src/**/*",
        "../../../modules/domain/**/games/**/*.{html,svelte.js,svelte,css}",
        "../../interfaces/display/**/*",
        "../../shared/**/*",
      ],
    },
  },
}); // import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
// import { sveltekit } from "@sveltejs/kit/vite";
// import { defineConfig } from "vite";

// // import config from "@vivalence/config";

// // https://github.com/bluwy/create-vite-extra/tree/master/template-deno-svelte/src
// import "svelte";
// import "@sveltejs/kit";

// import "tailwindcss";
// import "postcss";
// import "autoprefixer";
// import "@tailwindcss/typography";
// import "@sveltejs/vite-plugin-svelte";
// import "tailwind-merge";
// import "tailwind-variants";
// import "clsx";
// import "bits-ui";

// // import "@std/encoding/hex"; import "@std/crypto";

// // import "dockview-core";
// // import "mitt";
// // import "three";
// // import "tinykeys";

// const root = dirname(fromFileUrl(import.meta.url));

// export default defineConfig({
//   resolve: {
//     alias: {
//       "@client/shadcn/": join(root, "./src/shadcn/"),
//       "@client/lib/": join(root, "./src/lib/"),
//       "@client/components/": join(root, "./src/components/"),
//       "@client/icons/": join(root, "./static/icons/"),
//       "@client/context": join(root, "./src/context.js"),

//       "@vivalence/interface": join(root, "../../interfaces/display/mod.js"),
//       "@vivalence/shared": join(root, "../../shared/client.js"),

//       "@threlte/core": join(
//         root,
//         "../../vendor/threlte/packages/core/src/lib/index.ts",
//       ),
//       "@threlte/extras": join(
//         root,
//         "../../vendor/threlte/packages/extras/src/lib/index.ts",
//       ),
//       "@threlte/rapier": join(
//         root,
//         "../../vendor/threlte/packages/rapier/src/lib/index.ts",
//       ),
//     },
//     extensions: [".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"],
//     // @lj: .mjs for threejs
//   },
//   plugins: [sveltekit()],
//   server: {
//     fs: { allow: ["../../.."] },
//     watch: {
//       usePolling: true,
//       ignored: ["**/node_modules/**", "**/#*/**", "**/#*"],
//       include: [
//         "./src/**/*",
//         "../../../modules/domain/**/games/**/*.{html,svelte.js,svelte,css}",
//         "../../interfaces/display/**/*",
//         "../../shared/**/*",
//       ],

//       // include: ["./src/**/*", "../../../modules/games/**/*.{html,svelte.js,svelte,css}", "../../interfaces/display/**/*", "../../shared/**/*",],
//     },
//   },
// });
