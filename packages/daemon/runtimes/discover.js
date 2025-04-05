import { loadFromRepo, loadModule, loadModules } from "./lib/discover.ts";

export default async function discover(daemon) {
  const Runtimes = [];

  for await (const RuntimeModule of await loadFromRepo()) {
    const [Domain, Ontology, Corpora] = await Promise.all([
      await loadModule(RuntimeModule.modules.domain, daemon),
      await loadModule(RuntimeModule.modules.ontology, daemon),
      await loadModules(RuntimeModule.modules.corpora, daemon), // corpora
    ]);

    // some clever multiplexing based on domain spec.
    const Strategies = {};
    const Games = [];
    const Tactics = [];

    await Promise.all(
      Corpora.map(async (Corpus) => {
        // DOMAIN.games?
        // ONTOLOGY.tactics?
        Games.push(...(await loadModules(Corpus.modules.games, daemon)));
        Tactics.push(...(await loadModules(Corpus.modules.tactics, daemon)));
        // Strategies.assign((await daemon.registry.loadModuleMap(Corpus.modules.strategies)));
      }),
    );

    Runtimes.push({
      Runtime: RuntimeModule,
      Domain,
      // should be handled by domain:
      Ontology,
      Corpora,
      Strategies,
      Games,
      Tactics,
      // Strategies
    });
  }

  return Runtimes;
}
