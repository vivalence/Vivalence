import { basename, dirname, fromFileUrl, join } from "$std/path/mod.ts";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { cache } from "esbuild-plugin-cache";
import vivaloader from "./loader.js";

import config from "@vivalence/config";

const root = join(dirname(fromFileUrl(import.meta.url)), "../../../../../");

const importmap = {
  imports: {
    "@vivalence/shared": join(root, "subsystems/shared/client.js"),
    "@vivalence/typology": join(root, "subsystems/typology/client.js"),
    "@vivalence/vector": join(root, "subsystems/vector/mod.js"),
    "@vivalence/surface": join(root, "surface/html/mod.js"),
    // "@vivalence/vendor": join(root, "subsystems/vendor/client.js"),
  },
};
//
// const root = config.joins.repository
const SVELTE_VERSION = "svelte";

// console.log(config);
export default async function (entry) {
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
    sourcemap: config.isDev ? "inline" : false,
    minify: true,
    bundle: true,
    outdir: dirname(entry),
    plugins: [
      cache({
        importmap: {
          imports: {
            svelte: SVELTE_VERSION,
            "svelte/": `${SVELTE_VERSION}/`,
          },
        },
      }),
      vivaloader({
        importmap,
      }),
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
        },
      }),
    ],
  });
  return build.outputFiles;
}

// "@vivalence/shared": join(root, "../../../../../packages/shared/client.js") ,
// "@vivalence/shared": join(root, "packages/shared/client.js"),

// "@vivalence/interface": "../../../../../../packages/interfaces/display/mod.js",
// "@vivalence/interface": "file:/" + join(root, "../../../../interfaces/display/mod.js"),

// "@vivalence/shared": join(root, "../../shared/client.js"),
// ugly. absolute or repo imports not working. doesnt import nested packages.
// "svelte-gestures": "https://esm.sh/svelte-gestures@5.0.4",
// "@rwh/keystrokes": "https://esm.sh/@rwh/keystrokes@1.5.6",
// tinykeys: "https://esm.sh/tinykeys@3.0.0",
