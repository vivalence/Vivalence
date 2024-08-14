import { dirname, basename } from "$std/path/mod.ts";

import esbuild from "npm:esbuild@latest";
import sveltePlugin from "npm:esbuild-svelte@latest";
import { cache } from "npm:esbuild-plugin-cache";

const logSizeInKB = (file) => {
  const sizeInBytes = file.contents.length;
  const sizeInKB = sizeInBytes / 1024;
  console.log(`Size of ${file.path}: ${sizeInKB.toFixed(2)} KB`);
};

export default async function (entry) {
  const build = await esbuild.build({
    entryPoints: [entry],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    target: "es6",
    format: "esm",
    write: false,
    treeShaking: true,
    sourcemap: true,
    minify: true,
    bundle: true,
    outdir: dirname(entry),
    outExtension: { ".js": ".svelte" },

    plugins: [
      cache(svelteImportMap),
      sveltePlugin({
        filterWarnings: (warning, handler) =>
          warning.code.startsWith("a11y-") ? null : handler(warning),
        compilerOptions: {
          filename: basename(entry),
          css: "injected",
        },
      }),
    ],
  });
  return build.outputFiles;
}

const svelte = "https://esm.sh/svelte@4.2.18";
const svelteImportMap = {
  importmap: {
    imports: {
      svelte,
      "svelte/store": `${svelte}/store`,
      "svelte/motion": `${svelte}/motion`,
      "svelte/internal": `${svelte}/internal`,
      "svelte/internal/disclose-version": `${svelte}/internal/disclose-version`,
      "svelte-gestures": "https://esm.sh/svelte-gestures@5.0.4",
      "@rwh/keystrokes": "https://esm.sh/@rwh/keystrokes@1.5.6",
    },
  },
};
