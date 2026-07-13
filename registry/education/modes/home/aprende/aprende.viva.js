import { Vector, App, shape } from "@vivalence/typology";
import { gather } from "./gather.js";

export { emitter } from "./emitter/index.js";
export { aperture } from "./aperture/index.js";
export { harness } from "./harness.js";
export { tools } from "./tools/index.js";

export const manifest = {
  type: "homepage",
  slug: "aprende",
  name: "Aprende",
  description: "Brazilian Portuguese course",
  traits: [
    "APPLICATION",
    "STANDALONE",
    "HARNESSED",
    "CONVERSATIONAL",
    "EXPOSED",
    "EMITTER",
    "TOOLED",
  ],
};

export const app = new App("buffer/Aprende.svelte");
