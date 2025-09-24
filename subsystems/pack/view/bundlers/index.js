import { basename, dirname, fromFileUrl, join } from "$std/path/mod.ts";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { cache } from "esbuild-plugin-cache";
import vivaloader from "./loader.js";

const SVELTE_VERSION = "svelte";

export async function svelte(entry, importmap, isDev) {
  const build = await esbuild.build({
    entryPoints: [entry],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    // external: ["$app/environment"],
    target: "es6",
    format: "esm",
    write: false,
    treeShaking: true,
    // in order for .map to be treated separately, i must parse the output file and replace the sourvemappingurl with the url under which its loadable. this is because the widget component creates a url from blob thus destroying the relative path reference. `// # sourceMappingURL=Game.svelte.map` -> https://xxx/Game.svelte.map
    sourcemap: isDev ? "inline" : false,
    minify: !isDev,
    bundle: true,
    outdir: dirname(entry),
    logOverride: {
      "invalid-source-mappings": "silent",
    },
    plugins: [
      cache({
        importmap: {
          imports: {
            svelte: SVELTE_VERSION,
            "svelte/": `${SVELTE_VERSION}/`,
          },
        },
      }),
      vivaloader({ importmap }),
      sveltePlugin({
        filterWarnings: (warning, handler) => {
          if (
            ["css_unused_selector"].includes(warning.code) ||
            warning.code.startsWith("a11y-")
          )
            return;
        },
        compilerOptions: {
          filename: basename(entry),
          css: "injected",
          // warningFilter: (warning) => console.log(warning),
        },
      }),
    ],
  });
  return build.outputFiles;
}

export default { svelte };
