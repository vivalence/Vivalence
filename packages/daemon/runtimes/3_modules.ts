import { Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";

const createModule = (runtime: Runtime, Module: Module): RuntimeModule => ({
  router: runtime.router?.create(),
  bus: runtime.bus?.scope(),
  entity: Module.entity,
  Module,
});

const instantiateModules = (runtime: Runtime, modules: Module[]) => {
  if (!Array.isArray(modules)) return [];
  if (!modules || modules.length === 0) return [];

  return modules.map((Module) => createModule(runtime, Module));
};

export default function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const Modules = runtime.Modules;
      const modules = {};
      modules.domain = createModule(runtime, Modules.Domain);
      modules.ontology = createModule(runtime, Modules.Ontology);
      modules.curricula = instantiateModules(runtime, Modules.Curricula);
      modules.games = instantiateModules(runtime, Modules.Games);
      modules.tactics = instantiateModules(runtime, Modules.Tactics);
      modules.strategies = instantiateModules(runtime, Modules.Strategies);
      runtime.modules = modules;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime instantiation error]", e);
    }
  }
  return daemon;
}
