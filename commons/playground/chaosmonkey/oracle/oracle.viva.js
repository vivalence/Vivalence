import { App, v, Vector } from "@vivalence/typology";

export { aperture } from "./aperture.js";
export { emitter } from "./emitter.js";
export { harness } from "./harness.js";
export { tools } from "./tools.js";

export const manifest = {
  type: "chaosmonkey",
  slug: "oracle",
  name: "Oracle",
  description:
    "Aperture calls harness.object.render — the chaosmonkey demo case.",
  version: "0.1.0",
  traits: [
    "APPLICATION",
    "STANDALONE",
    "HARNESSED",
    "TOOLING",
    "EXPOSED",
    "EMITTER",
    "CONVERSATIONAL",
  ],
};

export const application = new App("buffer/Oracle.svelte", v.buffer({ data: {} }));
