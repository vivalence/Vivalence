import { walk } from "$std/fs/mod.ts";
import config from "@vivalence/config";
import { deepClone } from "@vivalence/shared";

export default async function discover(daemon) {
  const entries = [];
  for await (const entry of walk(config.env.get("VIVA_RUNTIMES_DIR"), {
    maxDepth: 3,
    includeFiles: true,
    includeDirs: false,
    match: [/\.viva\.js$/],
  })) {
    if (entry.isFile) entries.push(entry);
  }

  for await (const entry of entries) {
    try {
      let Runtime = deepClone(await import(entry.path));
      
      if (Runtime.default) Runtime = Runtime.default;
      if (!Runtime || !Runtime.manifest) throw new Error(`Invalid module structure at ${path}`);
      if (Runtime.manifest.type !== "runtime") continue;

      Runtime = ensure(Runtime);

      Runtime.Services = {};
      for await (const [slug, service] of Object.entries(Runtime.services || {})) {
        Runtime.Services[slug] = await daemon.registry.load(service);
      }

      Runtime.modules.Domain = await daemon.registry.load(Runtime.modules.domain);
      Runtime.modules.Ontology = await daemon.registry.load(Runtime.modules.ontology);
      Runtime.modules.Corpora = await daemon.registry.loadMany(Runtime.modules.corpora);
      Runtime.modules.Games = [];
      Runtime.modules.Tactics = [];
      Runtime.modules.Strategies = await daemon.registry.loadMany(Runtime.modules.strategies);

      await Promise.all(
        Runtime.modules.Corpora.map(async (Corpus) => {
          Runtime.modules.Games.push(...(await daemon.registry.loadMany(Corpus.modules.games)));
          Runtime.modules.Tactics.push(...(await daemon.registry.loadMany(Corpus.modules.tactics)));
          Runtime.modules.Strategies.push(
            ...(await daemon.registry.loadMany(Corpus.modules.strategies)),
          );
        }),
      );

      Runtime.modules.Corpora = uniqueBySlug(Runtime.modules.Corpora);
      Runtime.modules.Games = uniqueBySlug(Runtime.modules.Games);
      Runtime.modules.Tactics = uniqueBySlug(Runtime.modules.Tactics);
      Runtime.modules.Strategies = uniqueBySlug(Runtime.modules.Strategies);

      Runtime = validate(Runtime);

      const { slug, version } = Runtime.manifest;

      const symbol = Symbol(slug + (version ? `@${version}` : ""));
      const runtime = { ["#symbol"]: symbol, Module: Runtime };
      daemon.runtimes.set(symbol, runtime);

    } catch (error) {
      console.error(`Failed to import potential runtime module at ${entry.path}`);
      console.error(`${error.message}`);
      console.error(error);
    }
  }
  return daemon;
}

const ensure = (Runtime) => {
  if (!Runtime.modules.domain) throw new Error(`Runtime module missing domain module`);
  if (!Runtime.modules.ontology) throw new Error(`Runtime module missing ontology module`);
  if (!Runtime.modules.corpora) throw new Error(`Runtime module missing corpora modules`);

  if (!Runtime.modules.strategies) Runtime.modules.strategies = [];
  if (!Runtime.modules.games) Runtime.modules.games = [];
  if (!Runtime.modules.tactics) Runtime.modules.tactics = [];

  return Runtime;
};

const validate = (Runtime) => {
  // More validation

  return Runtime;
};

const uniqueBySlug = (arr) => {
  const seen = new Set();
  return arr.flat().filter((item) => {
    const val = item?.manifest?.slug;
    if (seen.has(val)) {
      console.warn(`Duplicate module found: ${item.manifest.type}:${val}`, item.manifest);
      return false;
    }
    seen.add(val);
    return true;
  });
};
