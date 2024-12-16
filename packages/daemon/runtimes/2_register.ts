import { Daemon, Module, RuntimeInstaller } from "../../../types/types.d.ts";
import registerManifest from "./lib/registerManifest.ts";

const registerModule = async (runtime: RuntimeInstaller, Module: Module) => {
  const newManifest = await registerManifest(runtime, Module);

  Module.manifest = {
    ...Module.manifest,
    ...newManifest,
  };

  // Also change of context
  return Module as Module;
};

const registerModules = (runtime: RuntimeInstaller, Modules: Module[]) =>
  Promise.all(Modules.map((Module) => registerModule(runtime, Module)));

const isSafe = (Module: Module) => Module?.manifest?.type === "runtime";

export default async function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    // Should not happen, only for safety
    if (!runtime.Module?.modules) continue;

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
