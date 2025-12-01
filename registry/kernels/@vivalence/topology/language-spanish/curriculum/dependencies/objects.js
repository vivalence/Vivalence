export const dependencies = [
  {
    name: "Direct Object Usage",
    slug: "objects:direct",
    description: "Master direct object pronouns and their placement",
    preconditions: [
      { scope: { dependency: { slug: "pronouns:101" } } },
      { scope: { dependency: { slug: "verbs:101" } } },
      { scope: { dependency: { slug: "articles:103" } } },
    ],
    conditions: [
      {
        name: "Basic object placement",
        scope: { tag: { slug: "prontype:prs" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
      // {name: "Transitive verb usage", scope: { tag: { slug: "verb:transitive" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },},
      // {name: "Gender agreement in objects", scope: { tag: { slug: "gender:masc" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },},
      // {name: "Gender agreement in objects", scope: { tag: { slug: "gender:fem" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },},
    ],

    itinerary: {
      tactic: {
        slug: "pronominalization-practice",
        relations: {
          tags: {
            vocabulary: { slug: "vocabulary:a1" },
            tenses: [{ slug: "tense:pres" }],
            verbs: [
              { slug: "lemma:ver" },
              { slug: "lemma:comer" },
              { slug: "lemma:tener" },
              { slug: "lemma:escribir" },
              { slug: "lemma:mandar" },
              { slug: "lemma:comprar" },
            ],
          },
        },
      },
    },
  },
  {
    name: "Indirect Object Usage",
    slug: "objects:indirect",
    description: "Master indirect object pronouns and common verb patterns",
    preconditions: [{ scope: { dependency: { slug: "objects:direct" } } }],
    conditions: [
      // {name: "Indirect object recognition", scope: { tag: { slug: "prontype:ind" } }, assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },},
      // {name: "Dative verb patterns", scope: { tag: { slug: "verb:dative" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },},
      // {name: "Personal a mastery", scope: { tag: { slug: "prep:personal" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 3` },},
    ],
    itinerary: {
      tactic: {
        slug: "pronominalization-practice",
        relations: {
          tags: {
            vocabulary: { slug: "vocabulary:a1" },
            tenses: [{ slug: "tense:pres" }],
            verbs: [
              // Primary indirect
              { slug: "lemma:decir" },
              { slug: "lemma:dar" },
              { slug: "lemma:traer" },
              // Also work with both
              { slug: "lemma:escribir" },
              { slug: "lemma:mandar" },
              { slug: "lemma:comprar" },
            ],
          },
        },
      },
    },
  },

  // {name: "Combined Object Usage", slug: "objects-combined", description: "Master the combination and ordering of object pronouns", preconditions: [{ scope: { dependency: { slug: "objects-indirect" } } }], conditions: [{name: "Double object verbs", scope: { tag: { slug: "verb:ditransitive" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },}, {name: "Pronoun combinations", scope: { tag: { slug: "pron:combined" } }, assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },}, {name: "High direct object mastery", scope: { tag: { slug: "prontype:prs" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },}, {name: "High indirect object mastery", scope: { tag: { slug: "prontype:ind" } }, assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },},], itinerary: {tactic: {slug: "multi-element-integration", // Different pattern needed for combination relations: {tags: {structural: { slug: "structural:a1" }, required: [{ slug: "prontype:prs" }, { slug: "prontype:ind" }], context: [{ slug: "verb:ditransitive" }], optional: [{ slug: "pron:combined" }],}, games: {prose: { slug: "prose" }, translations: { slug: "translations" }, flashcards: { slug: "flashcards" }, composition: { slug: "composition" },},}, masks: {translations: {prompt: {goal: "Create sentences requiring both direct and indirect object pronouns. Focus on natural usage and correct order.",},}, composition: {prompt: {goal: "Combine direct and indirect object pronouns following Spanish order rules. Include se transformations where appropriate.",},},},},},},
];

export default dependencies;
