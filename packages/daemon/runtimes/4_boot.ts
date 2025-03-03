import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";
import { defaultModuleBoot, bootModule, bootModules } from "./lib/boot.ts";

export default async function (daemon: Daemon) {
  for (let [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const { Runtime } = runtime.Modules;

      Runtime.boot = Runtime.boot ?? defaultModuleBoot["runtime"];
      await Runtime.boot(runtime, Runtime);
      if (!runtime) throw new Error("Module boot failed");
      runtime.Module = Runtime;

      // they should probably boot staged.
      const [domain, ontology, corpora, games, tactics, strategies] = await Promise.all([
        bootModule(runtime, runtime.modules.domain),
        bootModule(runtime, runtime.modules.ontology),
        bootModules(runtime, runtime.modules.corpora),
        bootModules(runtime, runtime.modules.games),
        bootModules(runtime, runtime.modules.tactics),
        // bootModules(runtime, runtime.modules.strategies),
      ]);

      runtime.domain = domain;
      runtime.ontology = ontology;
      runtime.corpora = corpora;
      runtime.games = games;
      runtime.tactics = tactics;
      // runtime.modules.strategies = strategies;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime boot error]", e);
    }
  }
  return daemon;
}
