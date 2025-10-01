// import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

// import evaluate from "./methods/evaluate.js";
// import provision from "./methods/provision.js";

// const bundle = join(dirname(fromFileUrl(import.meta.url)), "/game/game.svelte.js");

// const data = {
//   mask: {
//     tags: {
//       infinitive: { slug: "verbform:inf" },
//     },
//   },
// };

export const manifest = {
  type: "game",
  slug: "conjugations",
  name: "Conjugations",
  description:
    "Practice conjugating 6 verbs at a time in different tenses and moods.",
  version: "0.0.2",
};

// export { bundle, data, evaluate, manifest, provision };
