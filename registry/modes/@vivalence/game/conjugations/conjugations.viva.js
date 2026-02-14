import { Aperture } from "@vivalence/vector/aperture";
import { View } from "@vivalence/typology";

import dataset from "./dataset/index.js";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const manifest = {
  type: "game",
  slug: "conjugations",
  name: "Conjugations",
  description:
    "Practice conjugating 6 verbs at a time in different tenses and moods.",
  version: "0.0.2",
  traits: ["VIEWABLE", "VALENTIC", "PRODUCTIVE"],
};

const view = new View("buffer/conjugations.svelte.js");

const aperture = new Aperture().open("/evaluate", evaluate);

const producer = new Aperture()
  .branch("/generate")
  .use(async (ctx, next) => {
    ctx.input.scope.producer = ctx.mode.entity.id;
    await next();
  })
  .open("/pending", provision);

export { manifest, view, aperture, producer, dataset };

// const data = {
//   mask: {
//     tags: {
//       infinitive: { slug: "verbform:inf" },
//     },
//   },
// };
