const dependency = [
  {
    name: "Basic Description Integration",
    slug: "basic-description-mastery",
    description: "Combine articles, nouns, ser, and adjectives fluently",
    preconditions: [
      { scope: { dependency: { slug: "article-system" } } },
      { scope: { dependency: { slug: "ser-basic" } } },
      { scope: { dependency: { slug: "adjectives-basic" } } },
    ],
    conditions: [
      // Higher thresholds for core components
      {
        scope: { tag: { slug: "lemma:ser" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        scope: { tag: { slug: "prontype:art" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        scope: { tag: { slug: "pos:adj" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "integration-practice",
        relations: {
          tags: {
            primary: [{ slug: "lemma:ser" }, { slug: "prontype:art" }, { slug: "pos:adj" }],
            context: [{ slug: "pos:noun" }],
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create sentences that require article agreement AND ser with adjectives",
            },
          },
        },
      },
    },
  },
  {
    name: "States & Location Integration",
    slug: "states-location-mastery",
    preconditions: [
      { scope: { dependency: { slug: "estar-basic" } } },
      { scope: { dependency: { slug: "prepositions-basic" } } },
    ],
    conditions: [
      {
        scope: { tag: { slug: "lemma:estar" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        scope: { tag: { slug: "pos:adp" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },
      },
      {
        scope: { tag: { slug: "sem:location" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "integration-practice",
        relations: {
          tags: {
            primary: [{ slug: "lemma:estar" }, { slug: "pos:adp" }],
            context: [{ slug: "sem:location" }, { slug: "sem:condition" }],
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create sentences combining location with state descriptions using estar",
            },
          },
        },
      },
    },
  },

  {
    name: "Action Expression Integration",
    slug: "action-expression-mastery",
    preconditions: [
      { scope: { dependency: { slug: "objects-combined" } } },
      { scope: { dependency: { slug: "regular-verbs" } } },
    ],
    conditions: [
      {
        scope: { tag: { slug: "prontype:prs" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },
      },
      {
        scope: { tag: { slug: "prontype:ind" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 8` },
      },
      {
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "integration-practice",
        relations: {
          tags: {
            primary: [{ slug: "verbform:fin" }, { slug: "prontype:prs" }, { slug: "prontype:ind" }],
            context: [{ slug: "pos:noun" }],
          },
        },
        masks: {
          translations: {
            prompt: {
              goal: "Create sentences requiring both direct and indirect object pronouns",
            },
          },
        },
      },
    },
  },
];
export default dependency;
