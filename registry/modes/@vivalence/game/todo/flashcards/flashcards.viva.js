import { View } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "test-flashcards",
  name: "Flashcards",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["TERMINAL", "BUFFERED"],
};

const view = new View("buffer/flashcards.svelte.js");

export { manifest, view };
