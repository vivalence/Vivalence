import fs from "fs-extra";
import { basename, dirname } from "@std/path";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { resolveImportMap, resolveModuleSpecifier } from "./importmap.js";

function mapimports(imports = {}, baseUrl) {
  const resolvedImportmap = resolveImportMap({ imports }, baseUrl);
  const namespace = "repoloader";
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: /^@vivalence\// }, async (args) => {
        const mod = resolveModuleSpecifier(args.path, resolvedImportmap, baseUrl);
        return { path: mod, namespace };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const fileUrlObj = new URL(args.path);
        const contents = await fs.readFile(fileUrlObj.pathname);
        const resolveDir = dirname(fileUrlObj.pathname);
        return { resolveDir, contents, loader: "js" };
      });
    },
  };
}

export async function svelte(entry, opts = {}) {
  const { prod = false, imports = {}, baseUrl = new URL(import.meta.url), nodePaths = [] } = opts;

  const config = {
    nodePaths,
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    minify: prod,
    bundle: true,
    sourcemap: prod ? false : "inline",
    write: false,
    format: "esm",
    target: "es6",
    treeShaking: true,
    outdir: dirname(entry),
    plugins: [
      mapimports(imports, baseUrl),
      sveltePlugin({
        preprocess: sveltePreprocess(),
        filterWarnings: (warning) => {
          if (["css_unused_selector"].includes(warning.code) || warning.code.startsWith("a11y-"))
            return;
        },
        css: true,
        compilerOptions: {
          dev: !prod,
          filename: basename(entry),
          css: "injected",
        },
      }),
    ],
  };

  config.stdin = {
    contents: [
      `import { mount, unmount } from "svelte";`,
      `import Component from "./${basename(entry)}";`,
      `export default (target, props) => {`,
      `  const instance = mount(Component, { target, props });`,
      `  return { instance, destroy: () => unmount(instance) };`,
      `};`,
    ].join("\n"),
    resolveDir: dirname(entry),
    loader: "js",
  };
  config.outfile = entry;
  delete config.outdir;

  const bundle = await esbuild.build(config);
  return bundle.outputFiles;
}
