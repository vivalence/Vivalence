import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Spaced Repetition",
  description: "Spaced Repetition",
  slug: "spaced-repetition",
  version: "0.0.3",
};

const relations = {
  tags: {
    scope: [
      { slug: "pos:noun" },
      { slug: "pos:pron" },
      { slug: "pos:adv" },
      { slug: "pos:part" },
      { slug: "pos:adp" },
      { slug: "pos:det" },
      { slug: "pos:verb" },
      { slug: "pos:adj" },
    ],
  },
  games: { flashcards: { slug: "flashcards" } },
};

const masks = {
  reps: 8,
  threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN"],
};

const data = { relations, masks };

export { manifest, data, provision };
