import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared";

import provision from "./trajectory/provision.js";
import generator from "./trajectory/generator.js";
// import discriminator from "./trajectory/discriminator.js";

const bundle = bundler(
  join(dirname(fromFileUrl(import.meta.url)), "/buffer/buffer.svelte.js"),
);

async function boot(runtime, game) {
  game.aperture.router.get(bundle.url, bundle.serve());
  game.aperture.open("/status", () => ({ status: "game ok" }));

  game.aperture
    .branch()
    .use(bundle.injectBundlePath(game.aperture.path))
    .open("/provision", provision);

  // console.log("runtime", runtime);
  // console.log("game", game);
  game.aperture.open("/generator", generator);
  //   .open("/discriminator", discriminator);
  // return runtime;
}

const data = {
  instruction: {
    learnables: {
      puella: "Latin noun meaning 'girl'",
      puer: "Latin noun meaning 'boy'",
      cantat: "Latin verb meaning 'sings/is singing'",
    },
    process: [
      { slug: "intro_noun", description: "Introduction to the noun 'puella'" },
      { slug: "practice_noun", description: "Practice with puella" },
      { slug: "intro_verb", description: "Introduction to the verb 'cantat'" },
      { slug: "combine", description: "Creating first sentence" },
      { slug: "comprehension", description: "Translation practice" },
      { slug: "second_noun", description: "Introduction to 'puer'" },
      { slug: "application", description: "Form second sentence" },
      { slug: "assessment", description: "Final translation review" },
    ],
  },
};

const manifest = {
  type: "game",
  slug: "gan",
  name: "Learning GAN",
  version: "0.0.1",
  description: "Generative-Adviserial Network for structured learning",
};

export { manifest, boot };
