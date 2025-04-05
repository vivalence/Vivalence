const dependencies = [
  {
    name: "Introduction to Pronouns",
    slug: "pronouns:101",
    description: "Basic practice with Spanish pronouns",
    preconditions: [],
    conditions: [
      {
        name: "Pronoun part of speech is learning (5)",
        scope: { tag: { slug: "pos:pron" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Personal pronoun type is learning (5)",
        scope: { tag: { slug: "prontype:prs" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
    ],
    itinerary: {
      tactic: {
        // implicit type
        // type feed type game type strategy
        slug: "spaced-repetition",
        relations: { tags: { scope: [{ slug: "pos:pron" }, { slug: "prontype:prs" }] } },
        masks: { reps: 4 },
      },
      // },
    },
  },
];

export default dependencies;
