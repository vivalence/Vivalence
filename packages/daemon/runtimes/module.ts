import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";
import { defaultModuleBoot, bootModule, bootModules } from "./lib/boot.ts";
import { createModule, createModules } from "./lib/module.ts";

export default function (daemon: Daemon) {
  return async (runtime: any) => {
    // let domain = createModule(runtime.config.domain, runtime);
    let domain = runtime.config.domain.boot(runtime);

    // runtime.modules= await Promise.all(
    //     Object.entries(domain.modules).map(async ([key, entity]) => {
    //       // daemon.entities[key] = await daemon.entities.em.getRepository(entity);
    //     }),
    //   );

    runtime.domain = await bootModule(domain, runtime);

    // let ontology = createModule(runtime.Modules.Ontology, runtime);

    // let corpora = createModules(runtime.Modules.Corpora, runtime);
    // let games = createModules(runtime.Modules.Games, runtime);
    // let tactics = createModules(runtime.Modules.Tactics, runtime);
    // runtime.strategies = createModules(runtime.Modules.Strategies, runtime);

    // await (runtime.Modules.Runtime.boot ?? defaultModuleBoot["runtime"])(runtime, runtime.Modules.Runtime,);
    // runtime.Module = runtime.Modules.Runtime;

    // [domain, ontology, corpora, games, tactics] = await Promise.all([
    // bootModule(ontology, runtime),
    // bootModules(corpora, runtime),
    // bootModules(games, runtime),
    // bootModules(tactics, runtime),
    // ]);

    // (runtime.domain = domain);
    // runtime.ontology = ontology;
    // runtime.corpora = corpora;
    // runtime.games = games;
    // runtime.tactics = tactics;

    return runtime;
  };
}
