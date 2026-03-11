import { View } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "speed-judge",
  traits: ["TERMINAL", "BUFFERED"],
};

const view = new View("buffer/speed-judge.svelte.js");

export { manifest, view };
