import { View } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "write",
  name: "Write",
  traits: ["VIEWABLE", "VALENTIC"],
};

const view = new View("buffer/write.svelte.js");

export { manifest, view, dataset };
