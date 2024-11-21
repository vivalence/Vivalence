import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

async function bootModule(runtime, module, Module) {
  const scopedModule = { ...runtime, router: module.router, bus: module.bus };

  const boot = module.Module.boot || defaultModuleBoot[module.manifest.type];
  if (!boot) return { ...scopedModule, manifest: module.manifest, Module: module.Module };

  const bootedModule = await boot(scopedModule, module.Module, Module);

  if (!bootedModule) {
    throw new Error(
      `Boot method for ${module.manifest.type}:${module.manifest.slug} must return runtime`,
    );
  }

  return { ...bootedModule, manifest: module.manifest, Module: module.Module };
}

async function bootModules(runtime, modules, Module) {
  if (!modules) return [];
  return await Promise.all(
    modules.map(async (module) => await bootModule(runtime, module, Module)),
  );
}

export default async function (daemon) {
  for (let [key, runtime] of daemon.runtimes.entries()) {
    try {
      const Module = runtime.Module;

      Module.boot = Module.boot || defaultModuleBoot["runtime"];
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

const defaultModuleBoot = {
  runtime: (runtime) => runtime,
  tactic: async (runtime, Tactic) => {
    if (!Tactic.provision) {
      throw new Error("Tactic module must export provision method");
    }
    runtime.router.route("/provision", Tactic.provision);
    return runtime;
  },
  game: async (runtime, Game) => {
    const bundle = bundler({ path: Game.bundle, url: runtime.manifest.url + Game.manifest.url });
    runtime.router.get(bundle.url, bundle.serve());
    // this should be handled by domain middlewares
    runtime.router.route("/provision", bundle.injectBundleUrl(), Game.provision);
    runtime.router.route("/evaluate", Game.evaluate);
    return runtime;
  },
};
