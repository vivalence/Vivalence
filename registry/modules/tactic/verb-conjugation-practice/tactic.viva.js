import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Verb Conjugation",
  slug: "verb-conjugation-practice",
  version: "0.0.7",
  description:
    "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation.",
};

const data = {
  relations: {
    units: {},
    tags: {
      vocabulary: { slug: "vocabulary:a1" },
      nouns: { slug: "pos:noun" },
      // adjectives: { slug: "pos:adj" },
      // some way to pass peronal pronouns / yo/tu/el/la - pronouns: [{ slug: "prontype:prs" }],

      verbs: [],
      tenses: [],
      moods: [],
      aspects: [],
    },
    games: {
      prose: { slug: "prose" },
      translations: {
        slug: "translations",
      },
      flashcards: { slug: "flashcards" },
      conjugations: { slug: "conjugations" },
    },
  },
  masks: {
    apply_blacklist: { verb: true },

    conjugations: {
      threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN"],
    },
    flashcards: {
      threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],
      reps: 4,
    },
    translations: {
      reps: 4,
      goal: `
Create a simple sentence to practice verb conjugation for language learners.

1. Use the exact verb form provided without changing its tense, mood, or person.
2. Create a natural sentence that correctly incorporates the given verb.
3. Use simple, everyday vocabulary suitable for the learner's level.
4. The sentence should be clear, concise, and make sense in conversation or writing.
5. Ensure the sentence demonstrates correct verb agreement and usage.

### Example:
Given verb: "digo" (I say)
Possible sentence: "Digo la verdad." (I say the truth.)

Remember to use the verb exactly as given and create a meaningful, level-appropriate sentence.`,
    },
  },
};

export { manifest, data, provision };
