import fs from "fs-extra";
import { basename, dirname, join } from "@std/path";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { resolveImportMap, resolveModuleSpecifier } from "importmap";

import paladin from "@vivalence/paladin";

const SVELTE_VERSION = "svelte"; // @5.39

const repopath = paladin.scope.system;
const reporoot = repopath.absolute;

// const surfacepath = paladin.scope.system.branch("/subsystems/surfaces/html");

const fileurl = new URL(import.meta.url);

const importmap = {
  imports: {
    "@vivalence/vector": join(reporoot, "subsystems/vector/mod.js"),
    "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
    "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
    "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),

    // "@vivalence/paladin": join(reporoot, "subsystems/config/mod.client.js"), // aspirational
    // "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // aspiration
    // "@vivalence/vendor": join(root, "subsystems/vendor/client.js"), // graved, not dead.
  },
};

export async function svelte(entry, isDev) {
  const bundle = await esbuild.build({
    // logLevel: "info" || "warning" || "debug",
    minify: !isDev,
    sourcemap: false ? "inline" : false,
    format: "esm",
    target: "esnext", // "es6"
    treeShaking: true,
    splitting: false,
    //
    bundle: true,
    entryPoints: [entry],
    write: false, // !important
    outdir: dirname(entry), // todo: remove
    packages: "external",
    banner: { js: "// readme: https://tiny.cc/419t001" },
    plugins: [
      mapimports(),
      sveltePlugin({
        preprocess: sveltePreprocess(),
        // filterWarnings: (warning, handler) => ["css_unused_selector"].includes(warning.code) || warning.code.startsWith("a11y-") || null,
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
        logOverride: {
          // "invalid-source-mappings": "silent",
          "unsupported-dynamic-import": "silent",
        },
      }),
    ],
  });
  return bundle.outputFiles;
}

function mapimports() {
  const resolvedImportmap = resolveImportMap(importmap, fileurl);
  const namespace = "repoloader";
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: /^@vivalence\// }, async (args) => {
        const mod = resolveModuleSpecifier(
          args.path,
          resolvedImportmap,
          fileurl,
        );
        return { path: mod, namespace };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const fileUrlObj = new URL(args.path);
        const contents = await fs.readFile(fileUrlObj.pathname);
        const resolveDir = dirname(fileUrlObj.pathname);
        // console.log(resolveDir, contents);
        return { resolveDir, contents, loader: "js" };
      });
    },
  };
}

// import { cache } from "esbuild-plugin-cache";
// aka hackyproxy http:// importmap resolver.
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
