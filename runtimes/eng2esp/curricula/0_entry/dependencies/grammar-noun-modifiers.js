const nounmodifiers1 = {
  name: "First Contact: Noun Modifiers",
  slug: "noun-modifiers:1",
  description: "All Noun Modifiers are introduced",
  preconditions: [],
  conditions: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }].map((tag) => ({
    name: `Aspect "${tag.slug.split(":")[0]}" is introduced`,
    scope: { tag },
    assertion: { jsonata: `$count($[$ = null or $ = "UNTOUCHED"]) = 0` },
  })),
  itinerary: {
    tactic: {
      slug: "ontological-branch-introduction",
      relations: {
        tags: {
          root: { slug: "pos:noun" },
          aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
        },
      },
      masks: {
        aspect: { memory: { accept: [null, "UNTOUCHED"] } },
      },
    },
  },
};

const nounmodifiers2 = {
  name: "Practice: Noun Modifiers",
  slug: "noun-modifiers:2",
  description: "20 Nouns and 5 of each Noun Modifier are known",
  preconditions: [{ scope: { dependency: { slug: "noun-modifiers:1" } } }],
  conditions: [
    {
      name: "20 Nouns are known",
      scope: { tag: { slug: "pos:noun" } },
      assertion: { jsonata: "$count($[$ in ['KNOWN', 'GRADUATED']]) >= 20" },
    },
    ...[
      { slug: "gender:masc" },
      { slug: "gender:fem" },
      { slug: "number:sing" },
      { slug: "number:plur" },
      { slug: "definite:def" },
      { slug: "definite:ind" },
    ].map((tag) => ({
      name: `Aspect "${tag.slug.replace(":", " ")}" is known`,
      scope: { tag },
      assertion: { jsonata: "$count($[$ in ['KNOWN', 'GRADUATED']]) >= 5" },
    })),
  ],
  itinerary: {
    // tactic: {
    // slug: "ontological-branch-introduction",
    // relations: {
    //   units: {},
    //   tags: {
    //     root: { slug: "pos:noun" },
    //     aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
    //   },
    //   games: {},
    // },
    // masks: {
    //   aspect: { memory: { accept: [null] } },
    // },
    // },
  },
};

export default [nounmodifiers1, nounmodifiers2];
