import { Aperture } from "@vivalence/vector/aperture";
import { View } from "@vivalence/typology";

import dataset from "./dataset/index.js";
import evaluate from "./methods/evaluate.js";
import * as generate from "./methods/generate.js";

const manifest = {
  type: "game",
  slug: "translations",
  name: "Translations",
  description: "Practice translating sentences",
  version: "0.1.0",
  traits: ["VIEWABLE", "VALENTIC", "PRODUCTIVE", "CHAOSMONKEY"],
};

const view = new View("buffer/translations.svelte.js");

const aperture = new Aperture().open("/evaluate", evaluate);

const production = new Aperture().branch("/generate").open("/feed", generate.feed);

export { manifest, view, aperture, production, dataset };

// // import evaluate from "./methods/evaluate.js";
// // import provision from "./methods/provision.js";

// // const bundle = bundler.makePath(
// //   import.meta.url,
// //   "./buffer/translations.svelte.js",
// // );

// const data = {
//   mask: {
//     goal: `### Task:
// Create simple sentence to practice.

// ### Instructions:
// Choose common, everyday nouns suitable for beginner level language learners.
// The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
// `,
//   },
// };

// const manifest = {
//   type: "game",
//   slug: "translations",
//   name: "Translations",
//   version: "0.0.4",
//   description: "Practice translating sentences",
// };

// export { data, manifest };
