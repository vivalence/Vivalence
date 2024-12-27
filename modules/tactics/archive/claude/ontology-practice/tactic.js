// tactic.viva.js
const manifest = {
  type: "tactic",
  name: "Ontological Feature Practice",
  slug: "ontology-practice",
  version: "1.0.0",
  description:
    "Practice any ontological feature through introduction, recognition, and application",
};

const data = {
  relations: {
    tags: {
      structural: { slug: "structural:a1" },
      target: [], // e.g., [{ slug: "gender:*" }]
      context: [], // e.g., [{ slug: "pos:noun" }]
      modifiers: [], // e.g., [{ slug: "number:*" }]
    },
    games: {
      prose: { slug: "prose" },
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
    },
  },
  masks: {
    flashcards: {
      status: ["UNTOUCHED", "UNKNOWN"],
    },
    prose: {
      prompt: {
        goal: `Introduce and explain an ontological feature in clear, simple terms.
               Focus on practical usage and clear examples.
               Suitable for absolute beginners encountering this concept.`,
      },
    },
    translations: {
      prompt: {
        goal: `Create simple statements demonstrating the ontological feature.
               Use only provided vocabulary.
               Focus on clear demonstration of the feature.`,
      },
    },
  },
};
