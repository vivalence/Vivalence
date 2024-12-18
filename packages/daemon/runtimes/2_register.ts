import { Daemon, Module, Runtime } from "@vivalence/types";
import registerManifest from "./lib/registerManifest.ts";

const registerModule = async (runtime: Runtime, module: Module): Promise<Module> => {
  const newManifest = await registerManifest(runtime, module);

  module.manifest = {
    ...module.manifest,
    ...newManifest,
  };

  return module;
};

const registerModules = (runtime: Runtime, moduleRecords: Module[]) =>
  Promise.all(moduleRecords.map((Module) => registerModule(runtime, Module)));

export default async function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      runtime.Module = await registerModule(runtime, runtime.Module);
      runtime.manifest = runtime.Module?.manifest;

      const [Domain, Ontology, Corpora, Games, Tactics, Strategies] = await Promise.all([
        registerModule(runtime, runtime.Module.modules.Domain),
        registerModule(runtime, runtime.Module.modules.Ontology),
        registerModules(runtime, runtime.Module.modules.Corpora),
        registerModules(runtime, runtime.Module.modules.Games),
        registerModules(runtime, runtime.Module.modules.Tactics),
        registerModules(runtime, runtime.Module.modules.Strategies),
      ]);

      runtime.Module.modules.Domain = Domain;
      runtime.Module.modules.Ontology = Ontology;
      runtime.Module.modules.Corpora = Corpora;
      runtime.Module.modules.Games = Games;
      runtime.Module.modules.Tactics = Tactics;
      runtime.Module.modules.Strategies = Strategies;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }
  return daemon;
}
