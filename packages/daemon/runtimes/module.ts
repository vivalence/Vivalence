import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";
import { defaultModuleBoot, bootModule, bootModules } from "./lib/boot.ts";

const createModule = (Module: Module, runtime: Runtime): RuntimeModule => ({
  aperture: runtime.aperture.branch(),
  emitter: runtime.emitter.branch(),
  entity: Module.entity,
  Module,
});

const createModules = (modules: Module[], runtime: Runtime) => {
  if (!Array.isArray(modules)) return [];
  if (!modules || modules.length === 0) return [];

  return modules.map((Module) => createModule(Module, runtime));
};

export default function (daemon: Daemon) {
  return async (runtime: any) => {
    runtime.domain = createModule(runtime.Modules.Domain, runtime);
    runtime.ontology = createModule(runtime.Modules.Ontology, runtime);
    runtime.curricula = createModules(runtime.Modules.Curricula, runtime);
    runtime.games = createModules(runtime.Modules.Games, runtime);
    runtime.tactics = createModules(runtime.Modules.Tactics, runtime);
    runtime.strategies = createModules(runtime.Modules.Strategies, runtime);

    await (runtime.Modules.Runtime.boot ?? defaultModuleBoot["runtime"])(
      runtime,
      runtime.Modules.Runtime,
    );
    await Promise.all([
      // bootModule(runtime.domain, runtime),
      // bootModule(runtime.ontology, runtime),
      // bootModules(runtime.corpora, runtime),
      // bootModules(runtime.games, runtime),
      // bootModules(runtime.tactics, runtime),
      // bootModules(runtime, runtime.strategies),
    ]);

    return runtime;
  };
}
