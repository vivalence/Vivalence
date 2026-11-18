import fs from "fs-extra";
import { basename, dirname } from "@std/path";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { resolveImportMap, resolveModuleSpecifier } from "./importmap.js";
import { pure } from "./pure.js";

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

const settings = (name, opts) => {
  const { prod = false, imports = {}, baseUrl = new URL(import.meta.url), nodePaths = [], plugins = [] } = opts;
  return {
    nodePaths,
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    minify: prod,
    bundle: true,
    sourcemap: prod ? false : "inline",
    write: false,
    metafile: true,
    format: "esm",
    target: "esnext",
    treeShaking: true,
    plugins: [
      ...plugins,
      mapimports(imports, baseUrl),
      pure,
      sveltePlugin({
        preprocess: sveltePreprocess({ typescript: { compilerOptions: { target: "esnext", verbatimModuleSyntax: true } } }),
        filterWarnings: (warning) => {
          if (["css_unused_selector"].includes(warning.code) || warning.code.startsWith("a11y-"))
            return;
        },
        css: true,
        compilerOptions: {
          dev: !prod,
          filename: name,
          css: "injected",
          cssHash: ({ hash, css }) => `svelte-${hash(css)}`,
        },
      }),
    ],
  };
};

export async function svelte(entry, opts = {}) {
  const config = settings(basename(entry), opts);
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

  return await esbuild.build(config);
}

export async function members(entries, opts = {}) {
  return await esbuild.build({
    ...settings("member", opts),
    sourcemap: false,
    entryPoints: entries,
    splitting: true,
    outdir: "members",
    entryNames: "[name]-[hash]",
    chunkNames: "chunk-[hash]",
  });
}
