import { bundler } from "@vivalence/shared";
import { BootFunction, Daemon, Module, Runtime, RuntimeModule } from "@vivalence/types";

async function bootModule(runtime: Runtime, module: RuntimeModule) {
  const scopedModuleRuntime = { ...runtime, router: module.router, bus: module.bus };

  const boot = module.Module.boot ?? defaultModuleBoot[module.Module.manifest.type];

  if (!boot) return { ...scopedModuleRuntime, entity: module.entity, Module: module.Module };

  const bootedModule = await boot(scopedModuleRuntime, module);

  if (!bootedModule) {
    throw new Error(
      `Boot method for ${module.Module.manifest.type ?? "runtime"}:${module.entity.slug} must return runtime`,
    );
  }

  return { ...bootedModule, entity: module.entity, Module: module.Module };
}

async function bootModules(runtime: Runtime, modules: RuntimeModule[]) {
  if (!modules) return [];

  return await Promise.all(modules.map(async (module) => await bootModule(runtime, module)));
}

export default async function (daemon: Daemon) {
  for (let [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const { Runtime, Domain } = runtime.Modules;

      // console.log("runtime.entity.url", runtime.entity.url);

      Runtime.boot = Runtime.boot ?? defaultModuleBoot["runtime"];
      runtime = await Runtime.boot(runtime, Runtime);
      if (!runtime) throw new Error("Module boot failed");

      const [domain, ontology, corpora, games, tactics, strategies] = await Promise.all([
        bootModule(runtime, runtime.modules.domain),
        bootModule(runtime, runtime.modules.ontology),
        bootModules(runtime, runtime.modules.corpora),
        bootModules(runtime, runtime.modules.games),
        bootModules(runtime, runtime.modules.tactics),
        // bootModules(runtime, runtime.modules.strategies),
      ]);

      runtime.modules.domain = domain;
      runtime.modules.ontology = ontology;
      runtime.modules.corpora = corpora;
      runtime.modules.games = games;
      runtime.modules.tactics = tactics;
      // runtime.modules.strategies = strategies;

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime boot error]", e);
    }
  }
  return daemon;
}

const defaultModuleBoot: { [key: string]: BootFunction } = {
  runtime: (runtime: Runtime) => Promise.resolve(runtime),

  tactic: (runtime: Runtime, tactic: RuntimeModule) => {
    // assert handlers
    if (!tactic.Module.provision) {
      throw new Error("Tactic module must export provision method");
    }

    runtime.router?.route("/provision", tactic.Module.provision);

    return Promise.resolve(runtime);
  },

  game: (runtime: Runtime, game: RuntimeModule) => {
    // assert handlers
    const bundle = bundler({
      entry: game.Module.bundle,
      serve: game.entity.url,
    });

    runtime.router.get(bundle.url, bundle.serve());

    // this should be handled by domain middlewares
    game.Module.provision &&
      runtime.router.route("/provision", bundle.injectBundleUrl(), game.Module.provision);
    game.Module.evaluate && runtime.router.route("/evaluate", game.Module.evaluate);

    return Promise.resolve(runtime);
  },
};

export type DefaultModuleBoot = typeof defaultModuleBoot;
