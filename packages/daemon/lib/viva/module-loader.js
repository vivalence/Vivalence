import { join, dirname } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";
import { getResolver, importModule, parseManifest } from "./registry.js";

async function buildRuntime(module, loadedModules) {
  const loadedModulePaths = new Set(loadedModules.keys());
  const runtime = {
    Runtime: null,
    Domain: null,
    Ontology: null,
    Corpus: null,
    Games: new Map(),
    Strategies: new Map(),
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
    } else if (moduleType === "Strategy") {
      runtime.Strategies.set(module.manifest.slug, module);
    } else if (runtime[moduleType]) {
      throw new Error(`Duplicate ${moduleType} module found: ${module.path}`);
    } else {
      runtime[moduleType] = module;
    }

    const declarations = parseManifest(module.manifest);
    for (const declaration of declarations) {
      const resolver = getResolver(declaration);
      const depPath = await resolver(declaration, module.path);
      const depModule = await importModule(depPath);
      await recursiveDiscover(depModule);
    }
  }

  await recursiveDiscover(module);
  return runtime;
}

async function discoverRuntimes(runtimesDir) {
  const runtimes = new Map();
  for await (const entry of walk(runtimesDir, { maxDepth: 1, exts: [".viva.js"] })) {
    if (entry.isFile) {
      try {
        const module = await importModule(`file://${entry.path}`);
        if (module.manifest.type === "Runtime") {
          runtimes.set(module.manifest.slug, module);
        }
      } catch (error) {
        console.warn(
          `Failed to import potential runtime module at ${entry.path}: ${error.message}`
        );
      }
    }
  }
  return runtimes;
}

async function getRuntimeModules(directory) {
  const runtimes = new Map();
  const loadedModules = new Map();

  for (const runtimeModule of (await discoverRuntimes(directory)).values()) {
    try {
      const runtime = await buildRuntime(runtimeModule, loadedModules);
      runtimes.set(runtime.Runtime.manifest.slug, runtime);
    } catch (error) {
      console.error(`Failed to build runtime for ${runtimeModule.manifest.slug}: ${error.message}`);
      console.error(error);
    }
  }
  return runtimes;
}

export default getRuntimeModules;
