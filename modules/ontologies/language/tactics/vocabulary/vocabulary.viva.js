import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Vocabulary Practice",
  slug: "vocabulary",
  version: "0.1.0",
  description: "Balanced vocabulary practice across different parts of speech",
};

const data = {
  relations: {
    tags: {
      // Core vocabulary scope
      vocabulary: { slug: "vocabulary:a1" },

      // Parts of speech
      nouns: { slug: "pos:noun" },
      verbs: { slug: "pos:verb" },
      adjectives: { slug: "pos:adj" },
      adverbs: { slug: "pos:adv" },
    },
    games: {
      flashcards: { slug: "flashcards" },
    },
  },
  masks: {
    // Basic configuration
    reps: 10,
    threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],

    // Simplified flashcard formatting options
    flashcard: {
      includeExamples: true,
      highlightGrammar: true,
    },
  },
};

export { manifest, data, provision };
