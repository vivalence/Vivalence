import config from "@vivalence/config";
import { join, dirname } from "$std/path/mod.ts";
import { walk } from "$std/fs/mod.ts";

import { getResolver, importModule, parseManifest } from "./registry.js";

async function buildRuntime(module, loadedModules) {
  const loadedModulePaths = new Set(loadedModules.keys());
  const runtime = {
    Runtime: null,
    Domain: null,
    Ontologies: new Map(),
    Corpora: new Map(),
    Games: new Map(),
    Strategies: new Map(),
    Tactics: new Map(),
  };
  async function recursiveDiscover(module) {
    if (loadedModulePaths.has(module.path)) {
      return;
    }
    loadedModules.set(module.path, module);
    loadedModulePaths.add(module.path);
    const moduleType = module.manifest.type;
    if (moduleType === "Game") {
      runtime.Games.set(module.manifest.slug, module);
    } else if (moduleType === "Ontology") {
      runtime.Ontologies.set(module.manifest.slug, module);
    } else if (moduleType === "Corpus") {
      runtime.Corpora.set(module.manifest.slug, module);
    } else if (moduleType === "Strategy") {
      runtime.Strategies.set(module.manifest.slug, module);
    } else if (moduleType === "Tactic") {
      runtime.Tactics.set(module.manifest.slug, module);
    } else if (runtime[moduleType]) {
      throw new Error(`Duplicate ${moduleType} module found: ${module.path}`);
    } else {
      runtime[moduleType] = module;
    }
    const declarations = parseManifest(module);
    for (const declaration of declarations) {
      const resolver = getResolver(declaration);
      const depPath = await resolver(declaration, module.path);
      const depModule = await importModule(depPath);
      await recursiveDiscover(depModule);
    }
  }
  await recursiveDiscover(module);
  console.log("module ", module);
  return runtime;
}

async function discoverRuntimes(runtimesDir) {
  const runtimes = new Map();
  for await (const entry of walk(runtimesDir, { maxDepth: 3, exts: [".viva.js"] })) {
    if (entry.isFile) {
      try {
        const module = await importModule(`file://${entry.path}`);
        if (module.manifest.type === "Runtime") {
          runtimes.set(module.manifest.slug, module);
        }
      } catch (error) {
        console.warn(
          `Failed to import potential runtime module at ${entry.path}: ${error.message}`,
        );
      }
    }
  }
  return runtimes;
}

// async function getRuntimeModules(directory) {
//   const runtimes = new Map();
// for (const runtime of (await discoverRuntimes(directory)).values()) {runtimes.set(runtime.manifest.slug, runtime);}
//   // const loadedModules = new Map(); try {const runtime = await buildRuntime(runtimeModule)//, loadedModules);} catch (error) {console.error(`Failed to build runtime for ${runtimeModule.manifest.slug}: ${error.message}`); console.error(error);}
//   return runtimes;
// }

// const runtimeModule = (await discoverRuntimes(RuntimeDir)).values();
// const Runtimes = await getRuntimeModules(config.env.get("VIVA_RUNTIMES_DIR"));
// console.log("runtimeModule ", Runtimes);
// export default (d) => discoverRuntimes(d);
export default discoverRuntimes;
