import registry from "@vivalence/registry";
import { Module } from "@vivalence/types";

export const loadServices = async (serviceDescriptors: unknown) => {
  if (typeof serviceDescriptors !== "object" || serviceDescriptors === null) return {};

  const entries = Object.entries(serviceDescriptors);

  const loadedServices = await Promise.all(
    entries.map(async ([key, definition]) => {
      try {
        // if is string, load module
        if (typeof definition.service !== "string") {
          throw new Error(`Unsupported service descriptor type: ${typeof definition.service}`);
        }

        const service = await loadService(definition.service);
        return service ? [key, { ...definition, ...service }] : null;
      } catch (error) {
        console.error(`Failed to load module for key ${key}:`, error);
        return null;
      }
    }),
  );
  return Object.fromEntries(loadedServices.filter((entry) => entry?.service !== null));
};

export const loadService = async (moduleDescriptor: unknown) => {
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");
  const Module = await registry.load(moduleDescriptor);
  return Module;
};
