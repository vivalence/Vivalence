import { Aperture } from "@vivalence/vector/aperture";
import { View } from "@vivalence/typology";

import dataset from "./dataset/index.js";
import evaluate from "./methods/evaluate.js";
import * as generate from "./methods/generate.js";

const manifest = {
  type: "game",
  slug: "flashcards",
  name: "Flashcards",
  description: "Flashcards game for learning vocabulary",
  version: "0.0.1",
  traits: ["TERMINAL", "VALENTIC", "PRODUCTIVE"],
};

const view = new View("buffer/flashcards.svelte.js");

const aperture = new Aperture().open("/evaluate", evaluate);

const production = new Aperture()
  .branch("/generate")
  .open("/pending", generate.pending)
  .open("/fromSymbols", generate.fromSymbols)
  .open("/fromLiterals", generate.fromLiterals);

export { manifest, view, aperture, production, dataset };
