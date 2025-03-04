import config from "@vivalence/config";
import { walk } from "@std/fs";
import { obj } from "@vivalence/shared";

import { Daemon, Runtime, Module } from "@vivalence/types";
// import { RuntimeEntity, entities } from "@vivalence/schema";

export async function loadFromRepo() {
  const Runtimes = [];

  for await (const entry of walk(config.env.get("VIVA_RUNTIMES_DIR"), {
    maxDepth: 3,
    includeFiles: true,
    includeDirs: false,
    match: [/\.viva\.js$/],
  })) {
    const RuntimeModule = obj.deepClone(await import(entry.path));
    if (!RuntimeModule?.manifest) throw new Error(`Invalid module structure at ${entry.path}`);
    if (RuntimeModule.manifest.type !== "runtime") continue;
    Runtimes.push(RuntimeModule.default ?? RuntimeModule);
  }

  return Runtimes;
}

export const loadModules = async (moduleDescriptors: unknown, daemon: Daemon) => {
  if (!Array.isArray(moduleDescriptors)) return [];

  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => loadModule(moduleDescriptor, daemon)),
  );

  return modules.filter((module) => module);
};

export const loadModuleMap = async (moduleDescriptors: unknown, daemon: Daemon) => {
  if (typeof moduleDescriptors !== "object" || moduleDescriptors === null) return {};

  const entries = Object.entries(moduleDescriptors);
  const loadedModules = await Promise.all(
    entries.map(async ([key, descriptor]) => {
      try {
        const module = await loadModule(descriptor, daemon);
        return module ? [key, module] : null;
      } catch (error) {
        console.error(`Failed to load module for key ${key}:`, error);
        return null;
      }
    }),
  );

  return Object.fromEntries(
    loadedModules.filter((entry): entry is [string, Module] => entry !== null),
  );
};

export const loadModule = async (moduleDescriptor: unknown, daemon: Daemon) => {
  if (!daemon.registry) throw new Error("Registry is not initialized");
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");

  const Module = await daemon.registry.load<Module>(moduleDescriptor);
  return Module;
};
