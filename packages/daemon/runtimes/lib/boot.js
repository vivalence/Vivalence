import { bundler } from "@vivalence/shared";

const defaultModuleBoot = {
  Tactic: async (runtime, Tactic) => {
    if (!Tactic.provision) {
      throw new Error("Tactic module must export provision method");
    }
    runtime.router.route(
      "/",
      (ctx, next) => {
        console.log("depracated call to /tactic/ - move to /tactic/provision");
        next();
      },
      Tactic.provision,
    );
    runtime.router.route("/provision", Tactic.provision);
  },
  Game: async (runtime, Game) => {
    const bundle = bundler({ path: Game.bundle, url: Game.manifest.url });
    runtime.router.get(bundle.url, bundle.serve());
    runtime.router.route("/provision", bundle.injectBundleUrl(), Game.provision);
    runtime.router.route("/evaluate", Game.evaluate);
  },
};

async function bootable(runtime, Module) {
  const boot = Module.boot || defaultModuleBoot[Module.manifest.type];
  if (!boot) return runtime;
  return (await boot(runtime, Module)) || runtime;
}

async function boot(Module, runtime) {
  const { router, bus } = await bootable(
    { ...runtime, ...Module, manifest: runtime.manifest },
    Module,
  );

  return { manifest: Module.manifest, router, bus, Module };
}

boot.many = async (Modules, runtime) => {
  const booted = await Promise.all(Modules.values().map((M) => boot(M, runtime)));
  return new Map(booted.map((m) => [m.manifest.slug, m]));
};

export default boot;
