import { join } from "@std/path";
import { bundle } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const reporoot = paladin.scope.system.absolute;

const imports = {
  "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
  "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
  "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),
};

export async function svelte(entry) {
  return bundle.svelte(entry, {
    prod: paladin.is.prod,
    imports,
    baseUrl: new URL(import.meta.url),
  });
}

// import fs from "fs-extra";
// import { basename, dirname, join } from "@std/path";
// import { cache } from "esbuild-plugin-cache";
// import esbuild from "esbuild";
// import sveltePlugin from "esbuild-svelte";
// import { sveltePreprocess } from "svelte-preprocess";
// import { resolveImportMap, resolveModuleSpecifier } from "importmap";
// import paladin from "@vivalence/paladin";
// const repopath = paladin.scope.system;
// const reporoot = repopath.absolute;
// const fileurl = new URL(import.meta.url);
// const importmap = { imports: {
//   "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
//   "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
//   "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),
// }};
// function mapimports() { ... }
// export async function svelte(entry) { ... }
