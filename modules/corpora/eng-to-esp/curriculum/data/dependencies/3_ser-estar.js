// copula-dependencies.js

export const dependencies = [
  {
    name: "Basic Ser Usage",
    slug: "ser-basic",
    description: "Master fundamental uses of ser for identity and inherent traits",
    preconditions: [{ scope: { dependency: { slug: "verbs-101" } } }],
    conditions: [
      {
        name: "Ser conjugation mastery",
        scope: { tag: { slug: "lemma:ser" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "Basic adjectives with ser",
        scope: { tag: { slug: "pos:adj" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 8` },
      },
      {
        name: "Professional vocabulary",
        scope: { tag: { slug: "sem:profession" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "conjugation-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "lemma:ser" }],
            context: [{ slug: "pos:noun" }, { slug: "pos:adj" }],
            modifiers: [{ slug: "tense:pres" }, { slug: "mood:ind" }],
          },
          games: {
            conjugations: { slug: "conjugations" },
            translations: { slug: "translations" },
            flashcards: { slug: "flashcards" },
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create identity and description sentences using ser. Focus on permanent characteristics.",
            },
          },
        },
      },
    },
  },

  {
    name: "Basic Estar Usage",
    slug: "estar-basic",
    description: "Master fundamental uses of estar for states and locations",
    preconditions: [{ scope: { dependency: { slug: "subject-verbs-basic" } } }],
    conditions: [
      {
        name: "Estar conjugation mastery",
        scope: { tag: { slug: "lemma:estar" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "Location prepositions",
        scope: { tag: { slug: "pos:adp" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "Condition adjectives",
        scope: { tag: { slug: "sem:condition" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 6` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "conjugation-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "lemma:estar" }],
            context: [{ slug: "pos:adj" }, { slug: "pos:adp" }],
            modifiers: [{ slug: "tense:pres" }, { slug: "mood:ind" }],
          },
          games: {
            conjugations: { slug: "conjugations" },
            translations: { slug: "translations" },
            flashcards: { slug: "flashcards" },
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create location and condition sentences using estar. Focus on temporary states and positions.",
            },
          },
        },
      },
    },
  },

  {
    name: "Ser vs Estar Integration",
    slug: "ser-estar-distinction",
    description: "Master the distinction between ser and estar uses",
    preconditions: [
      { scope: { dependency: { slug: "ser-basic" } } },
      { scope: { dependency: { slug: "estar-basic" } } },
    ],
    conditions: [
      {
        name: "High ser competency",
        scope: { tag: { slug: "lemma:ser" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        name: "High estar competency",
        scope: { tag: { slug: "lemma:estar" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        name: "Dual-use adjectives",
        scope: { tag: { slug: "sem:dual-copula" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "integration-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "lemma:ser" }, { slug: "lemma:estar" }],
            context: [{ slug: "pos:adj" }],
            modifiers: [{ slug: "tense:pres" }, { slug: "mood:ind" }],
          },
          games: {
            prose: { slug: "prose" },
            translations: { slug: "translations" },
            flashcards: { slug: "flashcards" },
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create paired sentences showing meaning differences between ser and estar with the same adjectives.",
            },
          },
        },
      },
    },
  },
];

export default dependencies;
