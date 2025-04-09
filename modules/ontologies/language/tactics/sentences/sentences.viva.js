import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Sentence Construction",
  slug: "sentences",
  version: "0.0.0",
  description: "Practice sentence construction using specific grammatical patterns and components",
};

const data = {
  relations: {
    tags: {
      scope: [
        { slug: "pos:pron" },
        { slug: "prontype:prs" },
        { slug: "pos:verb" },
        { slug: "pos:noun" },
        { slug: "pos:adj" },
      ],
      tenses: [
        { slug: "tense:pres" },
        // { slug: "tense:past" },
        // { slug: "tense:fut" },
        // { slug: "tense:imp" },
      ],
      moods: [
        { slug: "mood:ind" },
        // { slug: "mood:sub" },
        // { slug: "mood:imp" },
        // { slug: "mood:cnd" },
      ],

      // vocabulary: { slug: "vocabulary:a1" },
    },
    games: {
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
    },
  },
  masks: {
    // apply_blacklist: {pronouns: true, verbs: true, nouns: true, adjectives: true, determiners: true,},
    apply_blacklist: true,
    reps: 4,

    flashcards: {
      threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],
      reps: 4,
    },

    complexity: "A2",
  },
};

export { manifest, data, provision };
