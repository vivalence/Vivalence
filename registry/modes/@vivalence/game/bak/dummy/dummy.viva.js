import { View } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "dummy",
  name: "dummy",
  description: "dymmy",
  version: "0.0.1",
  traits: ["VIEWABLE", "TERMINAL"],
};

const view = new View("buffer/dummy.svelte.js");

export { manifest, view };
