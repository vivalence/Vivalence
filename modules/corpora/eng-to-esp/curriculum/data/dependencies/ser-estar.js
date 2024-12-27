// copula-dependencies.js
const dependencies = [
  {
    name: "Basic Ser Usage",
    slug: "verbs:110",
    description: "Practice irregular ser verb forms",
    preconditions: [{ scope: { dependency: { slug: "verbs:101" } } }],
    conditions: [
      {
        name: "Ser learning (3)",
        scope: { tag: { slug: "lemma:ser" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3" },
      },
    ],
    itinerary: {
      tactic: {
        slug: "verb-conjugation-practice",
        relations: {
          tags: {
            tenses: [{ slug: "tense:pres" }],
            aspects: [{ slug: "aspect:imp" }],
            moods: [{ slug: "mood:ind" }],
            verbs: [{ slug: "lemma:ser" }],
          },
        },
        masks: {
          apply_blacklist: { verb: false },

          flashcards: {},
          translations: {
            goal: "Create simple sentences using ser, focusing on its conjugation patterns in the present tense.",
          },
        },
      },
    },
  },
  {
    name: "Basic Estar Usage",
    slug: "verbs:111",
    description: "Practice irregular estar verb forms",
    preconditions: [{ scope: { dependency: { slug: "verbs:101" } } }],
    conditions: [
      {
        name: "Estar learning (3)",
        scope: { tag: { slug: "lemma:estar" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3" },
      },
    ],
    itinerary: {
      tactic: {
        slug: "verb-conjugation-practice",
        relations: {
          tags: {
            tenses: [{ slug: "tense:pres" }],
            aspects: [{ slug: "aspect:imp" }],
            moods: [{ slug: "mood:ind" }],
            verbs: [{ slug: "lemma:estar" }],
          },
        },
        masks: {
          apply_blacklist: { verb: false },
          translations: {
            goal: "Create simple sentences using estar, focusing on its conjugation patterns in the present tense.",
          },
        },
      },
    },
  },
  {
    name: "Ser vs Estar Practice",
    slug: "verbs:112",
    description: "Practice distinguishing between ser and estar usage in present tense",
    preconditions: [
      { scope: { dependency: { slug: "verbs:110" } } },
      { scope: { dependency: { slug: "verbs:111" } } },
    ],
    conditions: [
      {
        name: "Ser known (3)",
        scope: { tag: { slug: "lemma:ser" } },
        assertion: { jsonata: "$count($[$ in ['KNOWN','GRADUATED']]) >= 3" },
      },
      {
        name: "Estar known (3)",
        scope: { tag: { slug: "lemma:estar" } },
        assertion: { jsonata: "$count($[$ in ['KNOWN','GRADUATED']]) >= 3" },
      },
      {
        name: "Present tense known (15)",
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: "$count($[$ in ['KNOWN','GRADUATED']]) >= 15" },
      },
    ],
    itinerary: {
      tactic: {
        slug: "verb-conjugation-practice",
        relations: {
          tags: {
            tenses: [{ slug: "tense:pres" }],
            aspects: [{ slug: "aspect:imp" }],
            moods: [{ slug: "mood:ind" }],
            verbs: [{ slug: "lemma:ser" }, { slug: "lemma:estar" }],
          },
        },
        masks: {
          apply_blacklist: { verb: true },
          translations: {
            goal: "Create simple sentences that demonstrate the difference between ser and estar usage in the present tense.",
          },
        },
      },
    },
  },
];
export default dependencies;
