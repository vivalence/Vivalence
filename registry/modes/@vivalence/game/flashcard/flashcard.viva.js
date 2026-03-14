import { View } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "flashcard",
  name: "Flashcard",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["VIEWABLE", "BUFFERED", "VALENTIC"],
};

const view = new View("buffer/flashcard.svelte.js");

const dataset = {
  entities: {
    valence: [
      {
        slug: "survival-flashcard",
        name: "Survival Flashcard",
        description: "",
        type: "SELFEVIDENT",
        traits: ["BUFFERED"],
        data: {
          BUFFERED: {
            recall: "LEARNING",
            seek: {
              symbols: ["word", "proficiency.survival"],
            },
          },
        },
      },
    ],
  },
};

export { manifest, view, dataset };
