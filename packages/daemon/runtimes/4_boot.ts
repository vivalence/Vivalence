import { bundler } from "@vivalence/shared";
import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";

async function bootModule(runtime: Runtime, module: RuntimeModule, Module: RuntimeModule) {
  const scopedModule = { ...runtime, router: module.router, bus: module.bus };

  const boot = module.Module?.boot ?? defaultModuleBoot[module.manifest?.type ?? "runtime"];
  if (!boot || !module.Module)
    return { ...scopedModule, manifest: module.manifest, Module: module.Module };

  const bootedModule = await boot(scopedModule, module.Module, Module);

  if (!bootedModule) {
    throw new Error(
      `Boot method for ${module.manifest?.type ?? "runtime"}:${
        module.manifest?.slug
      } must return runtime`,
    );
  }

  return { ...bootedModule, manifest: module.manifest, Module: module.Module };
}

async function bootModules(runtime: Runtime, modules: Module[], Module: RuntimeModule) {
  if (!modules) return [];

  return await Promise.all(
    modules.map(async (module) => await bootModule(runtime, module, Module)),
  );
}

export default async function (daemon: Daemon) {
  for (let [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const Module = runtime.Module;

      Module.boot = Module.boot ?? defaultModuleBoot["runtime"];
      runtime = await Module.boot(runtime, Module);
      if (!runtime) throw new Error("Module boot failed");

      const [domain, ontology, corpora, games, tactics, strategies] = await Promise.all([
        bootModule(runtime, runtime.domain, Module),
        bootModule(runtime, runtime.ontology, Module),
        bootModules(runtime, runtime.corpora, Module),
        bootModules(runtime, runtime.games, Module),
        bootModules(runtime, runtime.tactics, Module),
        bootModules(runtime, runtime.strategies, Module),
      ]);

      runtime.domain = domain;
      runtime.ontology = ontology;
      runtime.corpora = corpora;
      runtime.games = games;
      runtime.tactics = tactics;
      runtime.strategies = strategies;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime boot error]", e);
    }
  }
  return daemon;
}

const defaultModuleBoot: { [key: string]: BootFunction } = {
  runtime: (runtime: Runtime) => Promise.resolve(runtime),

  tactic: (runtime: Runtime, Tactic: Module) => {
    if (!Tactic.provision) {
      throw new Error("Tactic module must export provision method");
    }

    runtime.router?.route("/provision", Tactic.provision);

    return Promise.resolve(runtime);
  },

  game: (runtime: Runtime, Game: Module) => {
    const bundle = bundler({
      entry: Game.bundle,
      serve: runtime.manifest.url + (Game.manifest.url ?? ""),
    });

    if (!runtime.router) return Promise.resolve(runtime);

    runtime.router.get(bundle.url, bundle.serve());

    // this should be handled by domain middlewares
    Game.provision && runtime.router.route("/provision", bundle.injectBundleUrl(), Game.provision);
    Game.evaluate && runtime.router.route("/evaluate", Game.evaluate);

    return Promise.resolve(runtime);
  },
};

export type DefaultModuleBoot = typeof defaultModuleBoot;
