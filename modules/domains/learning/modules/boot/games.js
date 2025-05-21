import { bundler } from "@vivalence/shared";

export default function boot(runtime) {
  for (const module of runtime.config.modules.games) {
    const game = {
      ...module,
      aperture: runtime.aperture.branch(`/game/${module.manifest.slug}`),
      emitter: runtime.emitter.branch(),
    };
    if (module.boot) {
      module.boot({ ...runtime, aperture: game.aperture, emitter: game.emitter }, game);
    } else {
      // assert handlers
      const bundle = bundler(module.bundle);

      game.aperture.router.get(bundle.url, bundle.serve());

      if (module.provision) {
        game.aperture
          .branch()
          .use(bundle.injectBundlePath(game.aperture.path))
          .open("/provision", module.provision);
      }
      if (module.evaluate) game.aperture.open("/evaluate", module.evaluate);

      game.aperture.open("/status", () => ({ status: "game ok" }));
    }

    runtime.modules.games[game.manifest.slug] = game;
  }
}
