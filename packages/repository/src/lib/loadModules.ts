import registry from "@vivalence/registry";
import { Module } from "@vivalence/types";

export const loadModuleMap = async (moduleDescriptors: unknown) => {
  if (typeof moduleDescriptors !== "object" || moduleDescriptors === null) return {};
  const entries = Object.entries(moduleDescriptors);
  const loadedModules = await Promise.all(
    entries.map(async ([key, descriptor]) => {
      try {
        let module;
        // if is string, load module
        if (typeof descriptor === "string") {
          module = await loadModule(descriptor);
        }
        // if is array, load array
        else if (Array.isArray(descriptor)) {
          module = await loadModuleArray(descriptor);
        }
        // if is object, load map
        else if (typeof descriptor === "object" && descriptor !== null) {
          module = await loadModuleMap(descriptor);
        } else {
          throw new Error(`Unsupported module descriptor type: ${typeof descriptor}`);
        }

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

export const loadModuleArray = async (moduleDescriptors: unknown) => {
  if (!Array.isArray(moduleDescriptors)) return [];
  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => loadModule(moduleDescriptor)),
  );
  return modules.filter((module) => module);
};

export const loadModule = async (moduleDescriptor: unknown) => {
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");
  const Module = await registry.load(moduleDescriptor);
  return Module;
};
