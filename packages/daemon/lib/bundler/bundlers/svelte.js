import config from "@vivalence/config";
import { dirname, basename } from "$std/path/mod.ts";

import esbuild from "npm:esbuild@latest";
import sveltePlugin from "npm:esbuild-svelte@latest";
import { cache } from "npm:esbuild-plugin-cache";

export default async function (entry) {
  const build = await esbuild.build({
    entryPoints: [entry],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    target: "es6",
    format: "esm",
    write: false,
    treeShaking: true,
    // in order for .map to be treated separately, i must parse the output file and replace the sourvemappingurl with the url under which its loadable. this is because the widget component creates a url from blob thus destroying the relative path reference. `// # sourceMappingURL=Game.svelte.map` -> https://xxx/Game.svelte.map
    sourcemap: config.isDev ? "inline" : false,

    minify: true,
    bundle: true,
    outdir: dirname(entry),
    outExtension: { ".js": ".svelte" },
    plugins: [
      cache(svelteImportMap),
      sveltePlugin({
        filterWarnings: (warning, handler) => {
          if (!warning.code.startsWith("a11y-")) {
            console.warn("[Game Build Warnings:]");
            console.warn(entry);
            console.warn(warning);
            console.warn("[/Game Build Warnings]");
          }
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

// console.log(`${config.env.get("VIVA_PACKAGES_DIR")}/ui/mod.js`);
// /Users/finn/vivalence/code/vivalence/packages/ui/mod.js
const svelte = "https://esm.sh/svelte@4.2.18";

const svelteImportMap = {
  importmap: {
    imports: {
      svelte,
      // ugly. absolute or repo imports not working. doesnt import nested packages.
      "@vivalence/ui": `../../../../packages/ui/mod.js`,
      "svelte/store": `${svelte}/store`,
      "svelte/motion": `${svelte}/motion`,
      "svelte/internal": `${svelte}/internal`,
      "svelte/internal/disclose-version": `${svelte}/internal/disclose-version`,
      "svelte-gestures": "https://esm.sh/svelte-gestures@5.0.4",
      "@rwh/keystrokes": "https://esm.sh/@rwh/keystrokes@1.5.6",
    },
  },
};
