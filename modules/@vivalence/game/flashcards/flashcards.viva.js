import { Aperture } from "@vivalence/vector/aperture";
import { View, Path } from "@vivalence/typology";
// import { agent } from "./aperture/index.js";

const manifest = {
  type: "game",
  slug: "flashcards",
  name: "Flashcards",
  description: "Flashcards game for learning vocabulary",
  version: "0.0.1",
  traits: ["GENERATOR"], // "VIEWABLE","VALENTIC"
};

const view = new Path("/buffer/flashcards.svelte.js");

// async function feed(input, ctx) {return [{ agent: "welcome user" }];}
// const generate = (v) => v.open("/feed", feed); // maybe define input

const aperture = new Aperture(); //.open("/agent", agent);

export default { manifest, view, aperture };
// // import { bundler } from "@vivalence/shared";
// import evaluate from "./methods/evaluate.js";
// import provision from "./methods/provision/index.js";

// // const bundlePath = bundler.makePath(import.meta.url, "./buffer/gan.svelte.js");

// async function boot(runtime, game) {
//   // const bundle = bundler(bundlePath);
//   // bundle.url = bundle.absoluteUrl(game.aperture.path);
//   // bundle.path = bundlePath;
//   // game.bundle = bundle;

//   // runtime.aperture.router.get(bundle.get, bundle.serve);

//   runtime.aperture
//     .branch("/provision")
//     // .use(bundle.middleware)
//     .open("/fromTagIds", provision.fromTagIds)
//     .open("/fromUnitIds", provision.fromUnitIds)
//     .open("/fromUnits", provision.fromUnits)
//     .open("/fromLLM", provision.fromLLM);

//   runtime.aperture.open("/evaluate", evaluate);
// }

// export { manifest, boot };
