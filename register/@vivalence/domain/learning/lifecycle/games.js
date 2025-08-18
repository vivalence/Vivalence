import { bundler } from "@vivalence/shared";

export default function boot(runtime) {
  for (const module of runtime.register.modules.games) {
    // assert module schema
    // if (!game.bundle?.path)
    //   throw new Error("[/learning/boot/games.js] Bundle Required", game);
    // const bundle = bundler(game.bundle.path);
    // bundle.url = bundle.absoluteUrl(game.aperture.path);
    // bundle.path = game.bundle.path;
    // game.bundle = bundle;
    // game.aperture.router.get(bundle.get, bundle.serve);
  }

  // runtime.modules.game[game.manifest.slug] = game;
  // }
  // return runtime;
}
