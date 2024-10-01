import provision from "./provision.js";

const tactic = {
  relations: {
    units: {},
    tags: {
      structural: { slug: "structural:a1" },
      vocabulary: [{ slug: "pos:noun" }, { slug: "pos:adj" }],
      mood: { slug: "mood:ind" },
      tense: { slug: "tense:pres" },
      verbs: [
        { slug: "lemma:creer" },
        { slug: "lemma:dar" },
        { slug: "lemma:deber" },
        { slug: "lemma:decir" },
        { slug: "lemma:estar" },
        { slug: "lemma:hablar" },
        { slug: "lemma:hacer" },
        { slug: "lemma:ir" },
        { slug: "lemma:llegar" },
        { slug: "lemma:llevar" },
        { slug: "lemma:parecer" },
        { slug: "lemma:pasar" },
        { slug: "lemma:poder" },
        { slug: "lemma:poner" },
        { slug: "lemma:quedar" },
        { slug: "lemma:querer" },
        { slug: "lemma:saber" },
        { slug: "lemma:ser" },
        { slug: "lemma:tener" },
        { slug: "lemma:ver" },
      ],
    },
    games: {
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
      conjugations: { slug: "conjugations" },
    },
  },
  masks: {
    translations: {
      prompt: {
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
  },
};

const manifest = {
  type: "Tactic",
  name: "Verb Conjugation",
  slug: "applying-verb-conjugations",
  version: "0.0.1",
  description:
    "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation.",
};
export { manifest, tactic, provision };
