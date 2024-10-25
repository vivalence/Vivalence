const createModule = (runtime, Module) => ({
  router: runtime.router.create(),
  bus: runtime.bus.scope(),
  manifest: Module.manifest,
  Module,
});

const instantiateModules = (runtime, modules) => {
  if (!modules || modules.length === 0) return [];
  return modules.map((Module) => createModule(runtime, Module));
};

export default function (daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      const Module = runtime.Module;

      runtime.domain = createModule(runtime, Module.modules.Domain);
      runtime.ontology = createModule(runtime, Module.modules.Ontology);
      runtime.corpora = instantiateModules(runtime, Module.modules.Corpora);
      runtime.games = instantiateModules(runtime, Module.modules.Games);
      runtime.tactics = instantiateModules(runtime, Module.modules.Tactics);
      runtime.strategies = instantiateModules(runtime, Module.modules.Strategies);

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime instantiation error]", e);
    }
  }
  return daemon;
}
