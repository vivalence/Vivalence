import { Daemon, Module, Runtime } from "../../../types/types.d.ts";
import registerManifest from "./lib/registerManifest.js";

const registerModule = async (runtime: Runtime, Module: Module | Runtime) => {
  Module.manifest = {
    ...Module.manifest,
    ...(await registerManifest(runtime, Module)),
  };

  return Module;
};

const registerModules = (runtime: Runtime, Modules: (Module | Runtime)[]) =>
  Promise.all(Modules.map((Module) => registerModule(runtime, Module)));

export default async function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      runtime.Module = (await registerModule(runtime, runtime.Module)) as Runtime["Module"];
      runtime.Module.manifest && (runtime.manifest = runtime.Module.manifest);

      if (!runtime.Module.modules) continue;

      const [Domain, Ontology, Corpora, Games, Tactics, Strategies] = await Promise.all([
        registerModule(runtime, runtime.Module.modules.Domain as Module),
        registerModule(runtime, runtime.Module.modules.Ontology as Module),
        registerModules(runtime, runtime.Module.modules.Corpora as Module[]),
        registerModules(runtime, runtime.Module.modules.Games as Module[]),
        registerModules(runtime, runtime.Module.modules.Tactics as Module[]),
        registerModules(runtime, runtime.Module.modules.Strategies as Module[]),
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
