import { walk } from "@std/fs";
import config from "@vivalence/config";
import { deepClone } from "@vivalence/shared";
import { Daemon, RuntimeDescription, Service, VivaModuleDescription } from "@vivalence/types";

const discoverModule = async (daemon: Daemon, moduleDescriptor: unknown) => {
  if (!daemon.registry) throw new Error("Registry is not initialized");
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");

  return await daemon.registry.load<VivaModuleDescription>(moduleDescriptor);
};

const discoverModules = async (daemon: Daemon, moduleDescriptors: unknown) => {
  if (!Array.isArray(moduleDescriptors)) return [];

  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => discoverModule(daemon, moduleDescriptor)),
  );

  return modules.filter((module) => module);
};

export default async function discover(daemon: Daemon) {
  const entries = [];

  // tobemoved @shared
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
      const VivaModuleDescription = deepClone(await import(entry.path)) as VivaModuleDescription;

      // if (RuntimeDescription.default) RuntimeDescription = RuntimeDescription.default;
      if (!VivaModuleDescription?.manifest)
        throw new Error(`Invalid module structure at ${entry.path}`);
      if (VivaModuleDescription.manifest.type !== "runtime") continue;

      ensure(VivaModuleDescription);

      if (!daemon.registry) continue;

      // Creating and registering services
      let RuntimeDescription: RuntimeDescription = {};
      RuntimeDescription.Services = {};

      for await (const [slug, service] of Object.entries(VivaModuleDescription.services)) {
        if (typeof service !== "string") continue;
        RuntimeDescription.Services[slug] = await daemon.registry.load<Service>(service);
      }

      // Creating and registering modules
      RuntimeDescription.modules = {
        Domain: await discoverModule(daemon, VivaModuleDescription.modules.domain),
        Ontology: await discoverModule(daemon, VivaModuleDescription.modules.ontology),
        Corpora: await discoverModules(daemon, VivaModuleDescription.modules.corpora),
        Games: [],
        Tactics: [],
        Strategies: await discoverModules(daemon, VivaModuleDescription.modules.strategies),
      };

      // TODO: null-checks
      if (Array.isArray(VivaModuleDescription.modules.Corpora)) {
        await Promise.all(
          VivaModuleDescription.modules.Corpora.map(async (Corpus) => {
            if (!daemon.registry) throw new Error("Registry is not initialized");

            const games = await daemon.registry.loadMany<VivaModuleDescription>(
              Corpus.modules.games,
            );
            RuntimeDescription.modules?.Games?.push(...games);

            const tactics = await daemon.registry.loadMany<VivaModuleDescription>(
              Corpus.modules.tactics,
            );
            RuntimeDescription.modules?.Tactics?.push(...tactics);

            const strategies = await daemon.registry.loadMany<VivaModuleDescription>(
              Corpus.modules.strategies,
            );
            RuntimeDescription.modules?.Strategies?.push(...strategies);
          }),
        );
      }

      RuntimeDescription.modules.Corpora = uniqueBySlug(RuntimeDescription.modules.Corpora);
      RuntimeDescription.modules.Games = uniqueBySlug(RuntimeDescription.modules.Games);
      RuntimeDescription.modules.Tactics = uniqueBySlug(RuntimeDescription.modules.Tactics);
      RuntimeDescription.modules.Strategies = uniqueBySlug(RuntimeDescription.modules.Strategies);

      RuntimeDescription = validate(RuntimeDescription);

      const { slug, version } = VivaModuleDescription.manifest;

      const symbol = Symbol(slug + (version ? `@${version}` : ""));
      const runtime = { ["#symbol"]: symbol, Module: RuntimeDescription };

      daemon.runtimes.set(symbol, runtime);
    } catch (error: unknown) {
      console.error(`Failed to import potential runtime module at ${entry.path}`);
      console.error(`${(error as Error).message}`);
      console.error(error);
    }
  }

  return daemon;
}

const ensure = (VivaModuleDescription: VivaModuleDescription) => {
  if (!VivaModuleDescription.modules.domain)
    throw new Error(`Runtime module missing domain module`);
  if (!VivaModuleDescription.modules.ontology)
    throw new Error(`Runtime module missing ontology module`);
  if (!VivaModuleDescription.modules.corpora)
    throw new Error(`Runtime module missing corpora modules`);

  if (!VivaModuleDescription.modules.strategies) VivaModuleDescription.modules.strategies = [];
  if (!VivaModuleDescription.modules.games) VivaModuleDescription.modules.games = [];
  if (!VivaModuleDescription.modules.tactics) VivaModuleDescription.modules.tactics = [];

  return VivaModuleDescription;
};

const validate = (RuntimeDescription: RuntimeDescription) => {
  // More validation

  return RuntimeDescription;
};

const uniqueBySlug = (arr?: VivaModuleDescription[]) => {
  const seen = new Set();

  if (!arr) return [];

  return arr.flat().filter((item) => {
    const val = item.manifest?.slug;

    if (seen.has(val)) {
      console.warn(`Duplicate module found: ${item.manifest?.type}:${val}`, item.manifest);
      return false;
    }

    seen.add(val);
    return true;
  });
};
