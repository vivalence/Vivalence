import { uniqueBySlug } from "@vivalence/shared";
import { Daemon, Runtime, Module } from "@vivalence/types";
import { entities } from "@vivalence/schema";

export const loadModules = async (daemon: Daemon, moduleDescriptors: unknown) => {
  if (!Array.isArray(moduleDescriptors)) return [];

  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => loadModule(daemon, moduleDescriptor)),
  );

  return modules.filter((module) => module);
};

export const loadModuleMap = async (daemon: Daemon, moduleDescriptors: unknown) => {
  if (typeof moduleDescriptors !== "object" || moduleDescriptors === null) return {};

  const entries = Object.entries(moduleDescriptors);
  const loadedModules = await Promise.all(
    entries.map(async ([key, descriptor]) => {
      try {
        const module = await loadModule(daemon, descriptor);
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

export const loadModule = async (daemon: Daemon, moduleDescriptor: unknown) => {
  if (!daemon.registry) throw new Error("Registry is not initialized");
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");

  const Module = await daemon.registry.load<Module>(moduleDescriptor);
  Module.Entity = entities[Module.manifest.type];

  return Module;
};

export const validate = (runtime: Runtime) => {
  // More validation
  // if (!runtime.Modules.Domain) throw new Error(`Runtime module missing domain module`);
  // if (!runtime.Modules.Ontology) throw new Error(`Runtime module missing ontology module`);
  // if (!runtime.Modules.Corpora) throw new Error(`Runtime module missing corpora modules`);
  // runtime.Modules.Corpora = uniqueBySlug(runtime.Modules.Corpora);
  // runtime.Modules.Games = uniqueBySlug(runtime.Modules.Games);
  // runtime.Modules.Tactics = uniqueBySlug(runtime.Modules.Tactics);
  // Runtime.modules.Strategies = uniqueBySlug(Runtime.modules.Strategies);
};
