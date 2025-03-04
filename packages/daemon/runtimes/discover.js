import { loadFromRepo, loadModule, loadModules } from "./lib/discover.ts";

export default async function discover(daemon) {
  const Runtimes = [];

  for await (const RuntimeModule of await loadFromRepo()) {
    const [Domain, Ontology, Curricula] = await Promise.all([
      await loadModule(RuntimeModule.modules.domain, daemon),
      await loadModule(RuntimeModule.modules.ontology, daemon),
      await loadModules(RuntimeModule.modules.curricula, daemon), // corpora
    ]);

    const Strategies = {};
    const Games = [];
    const Tactics = [];

    await Promise.all(
      Curricula.map(async (Curriculum) => {
        Games.push(...(await loadModules(Curriculum.modules.games, daemon)));
        Tactics.push(...(await loadModules(Curriculum.modules.tactics, daemon)));
        // Strategies.assign((await daemon.registry.loadModuleMap(Corpus.modules.strategies)));
      }),
    );

    Runtimes.push({
      Runtime: RuntimeModule,
      Domain,
      // should be handled by domain:
      Ontology,
      Curricula,
      Strategies,
      Games,
      Tactics,
      // Strategies
    });
  }

  return Runtimes;
}
