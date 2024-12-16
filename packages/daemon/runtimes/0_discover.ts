import { walk } from "$std/fs/mod.ts";
import { deepClone } from "@vivalence/shared";
import path from "node:path";
import config from "../../../config/src/mod.ts";
import { Daemon, Module, Runtime, Service } from "../../../types/types.d.ts";

type RuntimeManifestKeys = keyof Pick<Runtime, "modules" | "services" | "manifest" | "statics">;
type RuntimeManifest = Record<RuntimeManifestKeys, Record<string, unknown>> & {
  default?: RuntimeManifest;
};
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export type RuntimeInstaller = DeepPartial<Runtime>;

const installModule = async (
  daemon: Daemon,
  moduleDescriptor: unknown,
): Promise<Module | undefined> => {
  if (!daemon.registry) return;
  if (typeof moduleDescriptor !== "string") return;

  return await daemon.registry.load<Module>(moduleDescriptor);
};

const installModules = async (daemon: Daemon, moduleDescriptors: unknown): Promise<Module[]> => {
  if (!Array.isArray(moduleDescriptors)) return [];

  const modules = await Promise.all(
    moduleDescriptors.map((moduleDescriptor) => installModule(daemon, moduleDescriptor)),
  );

  // TODO: simplify
  return modules.filter((module) => typeof module !== "undefined");
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
      let Runtime = deepClone(await import(entry.path)) as RuntimeManifest;

      if (Runtime.default) Runtime = Runtime.default;
      if (!Runtime?.manifest) throw new Error(`Invalid module structure at ${path}`);
      if (Runtime.manifest.type !== "runtime") continue;

      const RuntimeContainer: RuntimeInstaller = ensure(Runtime);

      if (!daemon.registry) continue;

      // Creating and registering services
      RuntimeContainer.Services = {};
      for await (const [slug, service] of Object.entries(Runtime.services)) {
        RuntimeContainer.Services[slug] = await daemon.registry.load<Service>(service as string);
      }

      // Creating and registering modules
      RuntimeContainer.modules = {};
      RuntimeContainer.modules.Domain = await installModule(daemon, Runtime.modules.domain);
      RuntimeContainer.modules.Ontology = await installModule(daemon, Runtime.modules.ontology);
      RuntimeContainer.modules.Corpora = await installModules(daemon, Runtime.modules.corpora);
      RuntimeContainer.modules.Strategies = await installModules(
        daemon,
        Runtime.modules.strategies,
      );
      RuntimeContainer.modules.Games = [];
      RuntimeContainer.modules.Tactics = [];

      // TODO: null-checks
      if (Array.isArray(Runtime.modules.Corpora)) {
        await Promise.all(
          Runtime.modules.Corpora?.map(async (Corpus) => {
            if (!daemon.registry) return Promise.resolve();

            const games = await daemon.registry.loadMany<Module>(Corpus.modules.games);
            RuntimeContainer.modules?.Games?.push(...games);

            const tactics = await daemon.registry.loadMany<Module>(Corpus.modules.tactics);
            RuntimeContainer.modules?.Tactics?.push(...tactics);

            const strategies = await daemon.registry.loadMany<Module>(Corpus.modules.strategies);
            RuntimeContainer.modules?.Strategies?.push(...strategies);
          }),
        );
      }

      // TODO: fix casting
      RuntimeContainer.modules.Corpora = uniqueBySlug(RuntimeContainer.modules.Corpora as Module[]);
      RuntimeContainer.modules.Games = uniqueBySlug(RuntimeContainer.modules.Games as Module[]);
      RuntimeContainer.modules.Tactics = uniqueBySlug(RuntimeContainer.modules.Tactics as Module[]);
      RuntimeContainer.modules.Strategies = uniqueBySlug(
        RuntimeContainer.modules.Strategies as Module[],
      );

      Runtime = validate(Runtime);

      const { slug, version } = Runtime.manifest;

      const symbol = Symbol(slug + (version ? `@${version}` : ""));
      const runtime = { ["#symbol"]: symbol, Module: RuntimeContainer };

      daemon.runtimes.set(symbol, runtime);
    } catch (error: unknown) {
      console.error(`Failed to import potential runtime module at ${entry.path}`);
      console.error(`${(error as Error).message}`);
      console.error(error);
    }
  }

  return daemon;
}

const ensure = (Runtime: RuntimeManifest): RuntimeInstaller => {
  if (!Runtime.modules.domain) throw new Error(`Runtime module missing domain module`);
  if (!Runtime.modules.ontology) throw new Error(`Runtime module missing ontology module`);
  if (!Runtime.modules.corpora) throw new Error(`Runtime module missing corpora modules`);

  if (!Runtime.modules.strategies) Runtime.modules.strategies = [];
  if (!Runtime.modules.games) Runtime.modules.games = [];
  if (!Runtime.modules.tactics) Runtime.modules.tactics = [];

  return Runtime as unknown as RuntimeInstaller;
};

const validate = (Runtime: RuntimeManifest) => {
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
