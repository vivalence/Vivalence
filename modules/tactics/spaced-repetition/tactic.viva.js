import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Spaced Repetition",
  description: "Spaced Repetition",
  slug: "spaced-repetition",
  version: "0.0.1",
};

const relations = {
  tags: {
    scope: [],
  },
  games: {
    flashcards: { slug: "flashcards" },
  },
};

const masks = {
  reps: 8,
  threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN"],
};

const data = { relations, masks };

export { manifest, data, provision };
