import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";

export const createModule = (Module: Module, runtime: Runtime): RuntimeModule => {
  return {
    aperture: runtime.aperture.branch(Module.entity.url?.modulename),
    emitter: runtime.emitter.branch(),
    entity: Module.entity,
    Module,
  };
};

export const createModules = (modules: Module[], runtime: Runtime) => {
  if (!Array.isArray(modules)) return [];
  if (!modules || modules.length === 0) return [];

  return modules.map((Module) => createModule(Module, runtime));
};
