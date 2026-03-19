import fs from "fs-extra";
import { basename, dirname, join } from "@std/path";
import { cache } from "esbuild-plugin-cache";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { resolveImportMap, resolveModuleSpecifier } from "importmap";

import paladin from "@vivalence/paladin";

const repopath = paladin.scope.system;
const reporoot = repopath.absolute;

// const surfacepath = paladin.scope.system.branch("/subsystems/surfaces/html");
// console.log({ cache });

const fileurl = new URL(import.meta.url);

const importmap = {
  imports: {
    "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
    "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
    "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),

    // "@vivalence/paladin": join(reporoot, "subsystems/config/mod.client.js"), // aspirational
    // "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // aspiration
    // "@vivalence/vendor": join(root, "subsystems/vendor/client.js"), // graved, not dead.
  },
};
// console.log({ importmap });

function mapimports() {
  const resolvedImportmap = resolveImportMap(importmap, fileurl);
  // console.log({ resolvedImportmap });
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
        // console.log("onResolve", { path: mod, namespace });
        return { path: mod, namespace };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const fileUrlObj = new URL(args.path);
        const contents = await fs.readFile(fileUrlObj.pathname);
        const resolveDir = dirname(fileUrlObj.pathname);
        // console.log(resolveDir, contents);
        // console.log("onLoad", {loader: "js", resolvePathname: fileUrlObj.pathname,});
        return { resolveDir, contents, loader: "js" };
      });
    },
  };
}

// const SVELTE_VERSION = "https://esm.sh/svelte@5.39.6";
const SVELTE_VERSION = "svelte"; // @5.39.6
const svelteImportMap = {
  importmap: {
    imports: {
      svelte: SVELTE_VERSION,
      "svelte/": `${SVELTE_VERSION}/`,
      // "svelte/internal/disclose-version": `${SVELTE_VERSION}/internal/disclose-version`,
      // "svelte/internal/client": `${SVELTE_VERSION}/internal/client`,
    },
  },
};

export async function svelte(entry, isDev) {
  // console.log("BUNDLING", entry);
  const bundle = await esbuild.build({
    // logLevel: "info" || "warning" || "debug",
    // minify: !isDev,
    entryPoints: [entry],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],

    minify: false,
    bundle: true,

    sourcemap: false ? "inline" : false,
    write: false, // !important
    format: "esm",
    // target: "esnext", // "es6"
    target: "es6", // "es6"
    treeShaking: true,
    // splitting: true,
    //
    outdir: dirname(entry), // todo: remove
    // keepNames: true,
    // packages: "external",
    // external: ["@std/*"],
    // external: ["svelte", "svelte/*", "@std/*"],
    // banner: { js: "// readme: https://tiny.cc/419t001" },
    plugins: [
      // cache
      // cache(svelteImportMap),
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
          // "unsupported-dynamic-import": "silent",
        },
      }),
    ],
  });
  // console.log({ bundle });
  return bundle.outputFiles;
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
