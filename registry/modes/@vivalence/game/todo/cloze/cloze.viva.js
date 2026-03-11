import { View } from "@vivalence/typology";
const manifest = {
  type: "game",
  slug: "cloze",
  name: "Cloze",
  description: "Fill the gap. Conjugations, pronouns, determiners.",
  version: "0.1.0",
  traits: ["TERMINAL", "BUFFERED"],
};
const view = new View("buffer/cloze.svelte.js");
export { manifest, view };
