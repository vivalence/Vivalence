import { walk } from "$std/fs/mod.ts";
import { deepClone } from "@vivalence/shared";
import path from "node:path";
import config from "../../../config/src/mod.ts";
import {
  Daemon,
  Module,
  RuntimeDescription,
  RuntimeInstaller,
  Service,
} from "../../../types/types.d.ts";

const discoverModule = async (daemon: Daemon, moduleDescriptor: unknown): Promise<Module> => {
  if (!daemon.registry) throw new Error("Registry is not initialized");
  if (typeof moduleDescriptor !== "string") throw new Error("Module descriptor is not a string");

  return await daemon.registry.load<Module>(moduleDescriptor);
};

const discoverModules = async (daemon: Daemon, moduleDescriptors: unknown): Promise<Module[]> => {
  if (!Array.isArray(moduleDescriptors)) return [];

  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => discoverModule(daemon, moduleDescriptor)),
  );

  return modules.filter((module) => module);
};

export default async function discover(daemon: Daemon) {
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
      let RuntimeDescription = deepClone(await import(entry.path)) as RuntimeDescription;

      if (RuntimeDescription.default) RuntimeDescription = RuntimeDescription.default;
      if (!RuntimeDescription?.manifest) throw new Error(`Invalid module structure at ${path}`);
      if (RuntimeDescription.manifest.type !== "runtime") continue;

      const RuntimeInstaller: RuntimeInstaller = ensure(RuntimeDescription);

      if (!daemon.registry) continue;

      // Creating and registering services
      RuntimeInstaller.Services = {};
      for await (const [slug, service] of Object.entries(RuntimeDescription.services)) {
        if (typeof service !== "string") continue;
        RuntimeInstaller.Services[slug] = await daemon.registry.load<Service>(service);
      }

      // Creating and registering modules
      RuntimeInstaller.modules = {
        Domain: await discoverModule(daemon, RuntimeDescription.modules.domain),
        Ontology: await discoverModule(daemon, RuntimeDescription.modules.ontology),
        Corpora: await discoverModules(daemon, RuntimeDescription.modules.corpora),
        Games: [],
        Tactics: [],
        Strategies: await discoverModules(daemon, RuntimeDescription.modules.strategies),
      };

      // TODO: null-checks
      if (Array.isArray(RuntimeDescription.modules.Corpora)) {
        await Promise.all(
          RuntimeDescription.modules.Corpora?.map(async (Corpus) => {
            if (!daemon.registry) throw new Error("Registry is not initialized");

            const games = await daemon.registry.loadMany<Module>(Corpus.modules.games);
            RuntimeInstaller.modules?.Games?.push(...games);

            const tactics = await daemon.registry.loadMany<Module>(Corpus.modules.tactics);
            RuntimeInstaller.modules?.Tactics?.push(...tactics);

            const strategies = await daemon.registry.loadMany<Module>(Corpus.modules.strategies);
            RuntimeInstaller.modules?.Strategies?.push(...strategies);
          }),
        );
      }

      // TODO: fix casting
      RuntimeInstaller.modules.Corpora = uniqueBySlug(RuntimeInstaller.modules.Corpora as Module[]);
      RuntimeInstaller.modules.Games = uniqueBySlug(RuntimeInstaller.modules.Games as Module[]);
      RuntimeInstaller.modules.Tactics = uniqueBySlug(RuntimeInstaller.modules.Tactics as Module[]);
      RuntimeInstaller.modules.Strategies = uniqueBySlug(
        RuntimeInstaller.modules.Strategies as Module[],
      );

      RuntimeDescription = validate(RuntimeDescription);

      const { slug, version } = RuntimeDescription.manifest;

      const symbol = Symbol(slug + (version ? `@${version}` : ""));
      const runtime = { ["#symbol"]: symbol, Module: RuntimeInstaller };

      daemon.runtimes.set(symbol, runtime);
    } catch (error: unknown) {
      console.error(`Failed to import potential runtime module at ${entry.path}`);
      console.error(`${(error as Error).message}`);
      console.error(error);
    }
  }

  return daemon;
}

const ensure = (RuntimeDescription: RuntimeDescription) => {
  if (!RuntimeDescription.modules.domain) throw new Error(`Runtime module missing domain module`);
  if (!RuntimeDescription.modules.ontology)
    throw new Error(`Runtime module missing ontology module`);
  if (!RuntimeDescription.modules.corpora)
    throw new Error(`Runtime module missing corpora modules`);

  if (!RuntimeDescription.modules.strategies) RuntimeDescription.modules.strategies = [];
  if (!RuntimeDescription.modules.games) RuntimeDescription.modules.games = [];
  if (!RuntimeDescription.modules.tactics) RuntimeDescription.modules.tactics = [];

  // This one here is meant to deal with some magic again
  // for the sake of thelling polimorphic types apart
  return RuntimeDescription as RuntimeInstaller;
};

const validate = (Runtime: RuntimeDescription) => {
  // More validation

  return Runtime;
};

const uniqueBySlug = (arr?: Module[]) => {
  const seen = new Set();

  if (!arr) return [];

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
