import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Verb Conjugation",
  slug: "verb-conjugation-practice",
  version: "0.0.x",
  description:
    "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation.",
};

const data = {
  relations: {
    units: {},
    tags: {
      vocabulary: { slug: "structural:a1" },
      // some way to pass peronal pronouns / yo/tu/el/la
      // pronouns: [{ slug: "prontype:prs" }],

      moods: [{ slug: "mood:ind" }],
      tenses: [{ slug: "tense:pres" }],
      verbs: [],
    },
    games: {
      prose: { slug: "prose" },
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
      conjugations: { slug: "conjugations" },
    },
  },
  masks: {
    translations: {
      constraints: [],
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
