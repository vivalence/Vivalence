import { registerModule, registerModules } from "./lib/register.ts";
import { Daemon, Module, Runtime } from "@vivalence/types";

export default function registerRuntimeModules(daemon: Daemon) {
  return async (runtime: Runtime) => {
    // const { domain, services } = runtime.config;
    // knows about runtime, services, strategies, domains.

    await registerModule(daemon, runtime, runtime.Modules.Runtime);
    runtime.entity = runtime.Modules.Runtime.entity;

    const [Domain, Ontology, Corpora, Games, Tactics, Strategies] = await Promise.all([
      registerModule(daemon, runtime, runtime.Modules.Domain),
      // registerModule(daemon, runtime, runtime.Modules.Ontology),
      // registerModules(daemon, runtime, runtime.Modules.Corpora),
      // registerModules(daemon, runtime, runtime.Modules.Games),
      // registerModules(daemon, runtime, runtime.Modules.Tactics),
      // registerModules(daemon, runtime, runtime.Modules.Strategies),
    ]);
    runtime.Modules.Domain = Domain;
    // runtime.Modules.Ontology = Ontology;
    // runtime.Modules.Corpora = Corpora;
    // runtime.Modules.Games = Games;
    // runtime.Modules.Tactics = Tactics;
    // runtime.Modules.Strategies = Strategies;

    return runtime;
  };
}
