import { Daemon, Module, Runtime } from "@vivalence/types";
import { registerModule, registerModules } from "./lib/register.ts";

export default async function registerRuntimeModules(daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      runtime.Modules.Runtime = await registerModule(daemon, runtime, runtime.Modules.Runtime);
      runtime.entity = runtime.Modules.Runtime.entity;

      const [Domain, Ontology, Curricula, Games, Tactics, Strategies] = await Promise.all([
        registerModule(daemon, runtime, runtime.Modules.Domain),
        registerModule(daemon, runtime, runtime.Modules.Ontology),
        registerModules(daemon, runtime, runtime.Modules.Curricula),
        registerModules(daemon, runtime, runtime.Modules.Games),
        registerModules(daemon, runtime, runtime.Modules.Tactics),
        // registerModules(daemon, runtime, runtime.Modules.Strategies),
      ]);
      runtime.Modules.Domain = Domain;
      runtime.Modules.Ontology = Ontology;
      runtime.Modules.Curricula = Curricula;
      runtime.Modules.Games = Games;
      runtime.Modules.Tactics = Tactics;
      // runtime.Modules.Strategies = Strategies;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }
  return daemon;
}
