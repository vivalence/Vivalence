// import config from "@vivalnce/config";
import { entities } from "@vivalence/schema";
// import { Daemon, Manifest, Module, Runtime } from "@vivalence/types";
import { runtimes } from "@vivalence/shared";
import { loadModule, loadModules, validate } from "./lib/discover.ts";

export const Runtimes = await runtimes.loadFromRepo();

export default async function discover(daemon) {
  for await (const RuntimeModule of Object.values(Runtimes)) {
    try {
      const [Domain, Ontology, Curricula] = await Promise.all([
        await loadModule(daemon, RuntimeModule.modules.domain),
        await loadModule(daemon, RuntimeModule.modules.ontology),
        await loadModules(daemon, RuntimeModule.modules.curricula),
      ]);

      const Strategies = {};
      const Games = [];
      const Tactics = [];

      await Promise.all(
        Curricula.map(async (Curriculum) => {
          Games.push(...(await loadModules(daemon, Curriculum.modules.games)));
          Tactics.push(...(await loadModules(daemon, Curriculum.modules.tactics)));
          // Strategies.assign((await daemon.registry.loadModuleMap(Corpus.modules.strategies)));
        }),
      );

      let runtime = {
        ["#symbol"]: Symbol(RuntimeModule.manifest.slug),
        // manifest: RuntimeModule.manifest,
        statics: RuntimeModule.statics,
        Modules: {
          Runtime: RuntimeModule,
          Domain,
          Ontology,
          Curricula,
          Strategies,
          Games,
          Tactics,
          // Strategies
        },
        // modules: {},
      };

      await validate(runtime);

      daemon.runtimes.set(runtime["#symbol"], runtime);
    } catch (error) {
      console.error(
        `Failed to import potential runtime module at "${JSON.stringify(RuntimeModule.manifest)}" `,
      );
      console.error(`${error.message}`);
      console.error(error);
    }
  }

  return daemon;
}
