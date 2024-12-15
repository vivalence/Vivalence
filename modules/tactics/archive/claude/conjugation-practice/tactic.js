// tactic.viva.js
const manifest = {
  type: "tactic",
  name: "Verb Conjugation Practice",
  slug: "conjugation-practice",
  version: "1.0.0",
  description: "Practice verb conjugations in specific tenses and moods",
};

const data = {
  relations: {
    tags: {
      structural: { slug: "structural:a1" },
      target: [], // e.g., [{ slug: "lemma:hablar" }]
      context: [], // e.g., [{ slug: "pos:noun" }]
      modifiers: [], // e.g., [{ slug: "tense:pres" }, { slug: "mood:ind" }]
    },
    games: {
      conjugations: { slug: "conjugations" },
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
    },
  },
  masks: {
    flashcards: {
      status: [null, "UNTOUCHED", "UNKNOWN"],
    },
    conjugations: {
      prompt: {
        goal: `Practice full conjugation paradigm.
               Focus on pattern recognition and formation rules.`,
      },
    },
    translations: {
      prompt: {
        goal: `Apply conjugated forms in simple sentences.
               Use exact forms without modification.
               Create natural, meaningful examples.`,
      },
    },
  },
};
