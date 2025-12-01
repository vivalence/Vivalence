import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Pronominalization Practice",
  slug: "pronominalization-practice",
  version: "0.0.2",
  description: "",
};

const data = {
  relations: {
    units: {},
    tags: {
      // vocabulary: { slug: "vocabulary:objects:a1" },
      nouns: { slug: "pos:noun" },
      verbs: [],
      tenses: [],
      numbers: [{ slug: "number:sing" }, { slug: "number:plur" }],
      persons: [{ slug: "person:1" }, { slug: "person:2" }, { slug: "person:3" }],
    },
    games: {
      flashcards: { slug: "flashcards" },
      nounform: { slug: "translations" },
      pronounform: { slug: "translations" },
    },
  },
  masks: {
    flashcards: {
      threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],
    },
    nounform: {
      constraints: [""],
      goal: `
You're given an action, a tense, a person and a number which make the performer, and a list of nouns / objects. 
We need a simple sentence demonstrating the noun-form of direct objects.
 `,
    },
    pronounform: {
      constraints: [""],
      goal: `You're given an action, a tense, a person and a number which make the performer, and a list of nouns / objects. 
We need a simple sentence demonstrating the pronoun-form of direct objects.
You're also given the noun-form. you create the corresponding pronoun form.
 `,
    },
  },
};

export { manifest, data, provision };
