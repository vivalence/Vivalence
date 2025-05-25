import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared";

import trajectory from "./trajectory/index.js";

const bundle = bundler(
  join(dirname(fromFileUrl(import.meta.url)), "/buffer/buffer.svelte.js"),
);

async function boot(runtime, game) {
  runtime.aperture.router.get(bundle.url, bundle.serve());
  runtime.aperture.open("/status", () => ({ status: "game ok" }));

  // game.aperture
  //   .branch()
  //   .use(bundle.injectBundlePath(game.aperture.path))
  //   .open("/provision", provision);

  // console.log("runtime", runtime);
  // console.log("game", game);

  trajectory(runtime);

  // return runtime;
}

const manifest = {
  type: "game",
  slug: "gan",
  name: "Learning GAN",
  version: "0.0.1",
  description: "Generative-Adviserial Network for structured learning",
};

export { manifest, boot };
