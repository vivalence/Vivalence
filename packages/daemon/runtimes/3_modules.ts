import { Daemon, Module, Runtime } from "../../../types/types.d.ts";

const createModule = (runtime: Runtime, Module: Module) =>
  ({
    router: runtime.router?.create(),
    bus: runtime.bus.scope(),
    manifest: Module.manifest,
    Module,
  } as Runtime);

const instantiateModules = (runtime: Runtime, modules: Module[]) => {
  if (!Array.isArray(modules)) return [];
  if (!modules || modules.length === 0) return [];

  return modules.map((Module) => createModule(runtime, Module));
};

export default function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const Module = runtime.Module;

      if (!Module.modules) continue;

      runtime.domain = createModule(runtime as Runtime, Module.modules.Domain as Module);
      runtime.ontology = createModule(runtime as Runtime, Module.modules.Ontology as Module);
      runtime.corpora = instantiateModules(runtime as Runtime, Module.modules.Corpora as Module[]);
      runtime.games = instantiateModules(runtime as Runtime, Module.modules.Games as Module[]);
      runtime.tactics = instantiateModules(runtime as Runtime, Module.modules.Tactics as Module[]);
      runtime.strategies = instantiateModules(
        runtime as Runtime,
        Module.modules.Strategies as Module[],
      );

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime instantiation error]", e);
    }
  }
  return daemon;
}
