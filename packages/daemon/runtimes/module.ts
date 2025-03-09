import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";
import { defaultModuleBoot, bootModule, bootModules } from "./lib/boot.ts";
import { createModule, createModules } from "./lib/module.ts";

export default function (daemon: Daemon) {
  return async (runtime: any) => {
    let domain = createModule(runtime.Modules.Domain, runtime);
    let ontology = createModule(runtime.Modules.Ontology, runtime);

    let curricula = createModules(runtime.Modules.Curricula, runtime);
    let games = createModules(runtime.Modules.Games, runtime);
    let tactics = createModules(runtime.Modules.Tactics, runtime);
    // runtime.strategies = createModules(runtime.Modules.Strategies, runtime);

    await (runtime.Modules.Runtime.boot ?? defaultModuleBoot["runtime"])(
      runtime,
      runtime.Modules.Runtime,
    );
    runtime.Module = runtime.Modules.Runtime;

    [domain, ontology, curricula, games, tactics] = await Promise.all([
      bootModule(domain, runtime),
      bootModule(ontology, runtime),
      bootModules(curricula, runtime),
      bootModules(games, runtime),
      bootModules(tactics, runtime),
    ]);

    runtime.domain = domain;
    runtime.ontology = ontology;
    runtime.curricula = curricula;
    runtime.games = games;
    runtime.tactics = tactics;

    //

    return runtime;
  };
}
