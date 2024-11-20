import config from "@vivalence/config";
import { join, fromFileUrl, dirname, basename } from "$std/path/mod.ts";

import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { cache } from "esbuild-plugin-cache";

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
    minify: false,
    bundle: true,
    outdir: dirname(entry),
    // outExtension: { ".js": ".svelte" },
    plugins: [
      cache(svelteImportMap),
      sveltePlugin({
        filterWarnings: (warning, handler) => {
          if (["css_unused_selector"].includes(warning.code) || warning.code.startsWith("a11y-"))
            return;

          console.warn("[Game Build Warnings:]");
          console.warn(warning);
          console.warn("");
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

// const SVELTE_VERSION = "https://esm.sh/svelte@5.1.9";
const root = dirname(fromFileUrl(import.meta.url));
const SVELTE_VERSION = "svelte";

const svelteImportMap = {
  importmap: {
    imports: {
      svelte: SVELTE_VERSION,
      "svelte/": `${SVELTE_VERSION}/`,

      "@vivalence/ui": `../../../../packages/interfaces/display/mod.js`, //

      // "@vivalence/ui": join(root, "../../interfaces/display/mod.js"),
      // "@vivalence/shared": join(root, "../../shared/client.js"),
      // ugly. absolute or repo imports not working. doesnt import nested packages.

      // "svelte-gestures": "https://esm.sh/svelte-gestures@5.0.4",
      // "@rwh/keystrokes": "https://esm.sh/@rwh/keystrokes@1.5.6",
    },
  },
};
