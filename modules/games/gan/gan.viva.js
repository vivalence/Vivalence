import { bundler } from "@vivalence/shared";

import aperture from "./aperture/index.js";

const bundlePath = bundler.makePath(import.meta.url, "./buffer/gan.svelte.js");

async function boot(runtime, game) {
  const bundle = bundler(bundlePath);
  bundle.url = bundle.absoluteUrl(game.aperture.path);
  bundle.path = bundlePath;
  game.bundle = bundle;
  game.data = {};

  runtime.aperture.router.get(bundle.get, bundle.serve);
  runtime.aperture.open("/librarian", aperture.librarian);
  runtime.aperture.open("/discriminator", aperture.discriminator);
  runtime.aperture.open("/generator", aperture.generator);
  runtime.aperture.open("/provision", aperture.provision);
  runtime.aperture.open("/learnables", aperture.learnables);
  runtime.aperture.open("/session", aperture.session);
}

const manifest = {
  type: "game",
  slug: "gan",
  name: "Learning GAN",
  version: "0.0.1",
  description:
    "Generative-Adviserial Network for human-centric structured learning.",
  valence: `# GAN: A text based game, good for introducing new concepts and terms. 
   Each game takes about 5 minutes. The game mode is conversational and itterative.
   The design of this game is inspired by the machine learning method and adapted to teach humans things.
   Each invocation is centered around a few (1-3) sentences, terms or vocabulary. 
   The game takes whatever input it receives, disaggregates it into a Set of Learnables and constructs a session-plan from that.
`,
};

export { manifest, boot };
