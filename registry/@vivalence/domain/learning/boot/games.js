import { bundler } from "@vivalence/shared";

export default function boot(runtime) {
  runtime.modules.game = {};

  for (const module of runtime.register.modules.games) {
    const game = {
      ...module,
      aperture: runtime.aperture.branch(`/game/${module.manifest.slug}`),
      // emitter: runtime.emitter.branch(),
    };

    game.aperture.use(async (ctx, next) => {
      ctx.game = game;
      return await next();
    });

    if (module.boot) {
      const scoped = {
        ...runtime,
        aperture: game.aperture,
        // emitter: game.emitter,
      };
      module.boot(scoped, game);
      // TODO: validate module
    } else {
      // assert module schema
      // if (!game.bundle?.path)
      //   throw new Error("[/learning/boot/games.js] Bundle Required", game);

      // const bundle = bundler(game.bundle.path);
      // bundle.url = bundle.absoluteUrl(game.aperture.path);
      // bundle.path = game.bundle.path;
      // game.bundle = bundle;

      // game.aperture.router.get(bundle.get, bundle.serve);

      if (module.provision) {
        game.aperture
          .branch()
          // .use(bundle.middleware)
          .open("/provision", module.provision);
      }
      if (module.evaluate) game.aperture.open("/evaluate", module.evaluate);
    }

    game.aperture.open("/get", () => ({
      manifest: game.manifest,
      bundle: {
        // path: game.bundle.path,
        // url: game.bundle.url.href,
      },
    }));
    game.aperture.open("/status", () => ({ status: "game ok" }));

    runtime.modules.game[game.manifest.slug] = game;
  }
  return runtime;
}
