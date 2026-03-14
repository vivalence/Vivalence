import { View } from "@vivalence/typology";

import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "shadow",
  name: "Shadow",
  traits: ["VIEWABLE", "VALENTIC", "BUFFERED"],
};

const view = new View("buffer/shadow.svelte.js");

export { manifest, view, dataset };
