import { App } from "@vivalence/typology";

export { emitter } from "./emitter/index.js";
export { aperture } from "./aperture/index.js";
export { buckets } from "./course.js";

export const manifest = {
  type: "tactic",
  slug: "impara",
  version: "0.1.0",
  name: "Impara",
  description:
    "Italian course in three buckets: vocabolario, grammatica, frasi.",
  traits: ["APPLICATION", "STANDALONE", "EMITTER", "EXPOSED"],
};

export const app = new App("buffer/Impara.svelte");
