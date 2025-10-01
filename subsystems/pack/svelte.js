import { basename, dirname, fromFileUrl, join } from "$std/path/mod.ts";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";

import { cache } from "esbuild-plugin-cache";
import vivaloader from "./loader.js";

const SVELTE_VERSION = "svelte"; // @5.39

export async function svelte(entry, importmap, isDev) {
  const bundle = await esbuild.build({
    // logLevel: "info" || "warning" || "debug",
    entryPoints: [entry],
    bundle: true,
    write: false,
    // mainFields: ["svelte", "browser", "module", "main"],
    // conditions: ["svelte", "browser"],
    packages: "external",
    format: "esm",
    // external: ["$app/environment"],
    // target: "es6",
    target: "esnext", // "es6"
    splitting: false,
    treeShaking: true,
    sourcemap: false ? "inline" : false,
    // minify: true, // !isDev,
    outdir: dirname(entry),
    logOverride: {
      // "invalid-source-mappings": "silent",
      "unsupported-dynamic-import": "silent",
    },
    banner: {
      js: "// readme: https://tiny.cc/419t001",
    },
    plugins: [
      // cache({
      //   importmap: {
      //     imports: {
      //       svelte: SVELTE_VERSION,
      //       "svelte/": `${SVELTE_VERSION}/`,
      //       // "svelte/internal/disclose-version": `${SVELTE_VERSION}/internal/disclose-version`,
      //       // "svelte/internal/": `${SVELTE_VERSION}/internal/`,
      //       // "svelte": "https://esm.sh/svelte@5.35.1",
      //       // "svelte/internal/disclose-version": "https://esm.sh/svelte@5.35.1/internal/disclose-version",
      //       // "svelte/internal/": "https://esm.sh/svelte@5.35.1/internal/"
      //       // "svelte": "https://esm.sh/svelte@5.35.1",
      //       // "svelte/internal/disclose-version": "https://esm.sh/svelte@5.35.1/internal/disclose-version",
      //       // "svelte/internal/": "https://esm.sh/svelte@5.35.1/internal/",
      //     },
      //   },
      // }),
      vivaloader({ importmap }),
      sveltePlugin({
        preprocess: sveltePreprocess(),
        filterWarnings: (warning, handler) => {
          if (
            ["css_unused_selector"].includes(warning.code) ||
            warning.code.startsWith("a11y-")
          )
            return;
        },
        css: true,
        compilerOptions: {
          filename: basename(entry),
          css: "injected",
          // warningFilter: (warning) => console.log(warning),
        },
      }),
    ],
  });
  return bundle.outputFiles;
}

export default { svelte };
