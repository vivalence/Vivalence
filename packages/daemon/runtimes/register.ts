import { registerModule, registerModules } from "./lib/register.ts";
import { Daemon, Module, Runtime } from "@vivalence/types";

export default function registerRuntimeModules(daemon: Daemon) {
  return async (runtime: Runtime) => {
    await registerModule(daemon, runtime, runtime.Modules.Runtime);
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

    return runtime;
  };
}
