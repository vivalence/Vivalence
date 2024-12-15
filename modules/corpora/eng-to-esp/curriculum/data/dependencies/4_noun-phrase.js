// noun-phrase-dependencies.js

export const dependencies = [
  {
    name: "Basic Adjectives",
    slug: "adjectives-basic",
    description: "Learn to use and agree adjectives with nouns in Spanish",
    preconditions: [
      { scope: { dependency: { slug: "article-system" } } }, // Need article agreement first
    ],
    conditions: [
      {
        name: "Basic adjective morphology",
        scope: { tag: { slug: "pos:adj" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "Gender agreement mastery",
        scope: { tag: { slug: "gender:masc" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "Gender agreement mastery",
        scope: { tag: { slug: "gender:fem" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "Number agreement mastery",
        scope: { tag: { slug: "number:sing" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "Number agreement mastery",
        scope: { tag: { slug: "number:plur" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "ontology-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "pos:adj" }],
            context: [{ slug: "pos:noun" }],
            modifiers: [{ slug: "gender:*" }, { slug: "number:*" }],
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
              goal: "Create simple noun phrases with adjectives. Focus on agreement patterns and common descriptive adjectives.",
            },
          },
          prose: {
            prompt: {
              goal: "Explain adjective agreement rules clearly with examples of both gender and number agreement.",
            },
          },
        },
      },
    },
  },
  {
    name: "Complex Descriptions",
    slug: "descriptions-complex",
    description: "Build rich noun phrases with multiple modifiers and proper agreement",
    preconditions: [
      { scope: { dependency: { slug: "adjectives-basic" } } },
      { scope: { dependency: { slug: "ser-basic" } } },
    ],
    conditions: [
      {
        name: "Adjective placement mastery",
        scope: { tag: { slug: "pos:adj" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },
      },
      {
        name: "Descriptive vocabulary",
        scope: { tag: { slug: "sem:descriptive" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        name: "Adjective order",
        scope: { tag: { slug: "syntax:modification" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "ontology-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "pos:adj" }, { slug: "syntax:modification" }],
            context: [{ slug: "pos:noun" }, { slug: "lemma:ser" }],
            modifiers: [{ slug: "gender:*" }, { slug: "number:*" }],
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
              goal: "Create noun phrases with multiple adjectives. Focus on adjective order and natural Spanish description patterns.",
            },
          },
          prose: {
            prompt: {
              goal: "Explain adjective placement rules and how multiple adjectives work together in Spanish descriptions.",
            },
          },
        },
      },
    },
  },
];
