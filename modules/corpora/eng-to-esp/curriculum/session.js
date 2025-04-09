const session = {
  name: "test",
  description: "",
  slug: "test",
  itinerary: [
    {
      for: { reps: 2 },
      do: {
        tactic: {
          slug: "sentences",
          relations: {
            tags: {
              //
            },
            games: {
              translations: { slug: "translations" },
              flashcards: { slug: "flashcards" },
            },
          },
          masks: {
            complexity: "A2",
            sentences: {
              length: { min: 2, max: 6 },
              reps: 5,
            },

            // flashcards: {threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"], reps: 3,},
            translation: { constraints: ["PATTERN: statement"] },
          },
        },
      },
    },
    {
      for: { reps: 2 },
      do: {
        tactic: {
          slug: "vocabulary",
          relations: {
            tags: {
              // vocabulary: { slug: "vocabulary:a1" },
              // nouns: { slug: "pos:noun" },
              // verbs: { slug: "pos:verb" },
              // adjectives: { slug: "pos:adj" },
              // adverbs: { slug: "pos:adv" },
            },
            games: {
              flashcards: { slug: "flashcards" },
            },
          },
          masks: {
            reps: 10,
            threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],
            // flashcard: {includeExamples: true, highlightGrammar: true,},
          },
        },
      },
    },
    {
      for: { reps: 2 },
      do: { dependency: { slug: "pronouns:101" } },
    },
    {
      for: { reps: 2 },
      do: { dependency: { slug: "verbs:101" } },
    },
  ],
};

export default session;
