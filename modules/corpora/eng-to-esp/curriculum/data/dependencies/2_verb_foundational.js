// verb-foundations-dependencies.js

export const dependencies = [
  {
    name: "Subject Pronouns and Basic Verbs",
    slug: "subject-verbs-basic",
    description: "Master subject pronouns and their relationship with verb endings",
    preconditions: [{ scope: { dependency: { slug: "noun-recognition" } } }],
    conditions: [
      {
        name: "First person forms in use",
        scope: { tag: { slug: "person:1" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Second person forms in use",
        scope: { tag: { slug: "person:2" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Third person forms in use",
        scope: { tag: { slug: "person:3" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Present tense forms familiar",
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "conjugation-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "lemma:hablar" }],
            context: [{ slug: "prontype:prs" }],
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
              goal: "Create simple sentences with subject pronouns and basic verb forms. One subject, one verb.",
            },
          },
        },
      },
    },
  },

  {
    name: "Regular Verb Patterns",
    slug: "regular-verbs",
    description: "Master the three regular verb conjugation patterns",
    preconditions: [{ scope: { dependency: { slug: "subject-verbs-basic" } } }],
    conditions: [
      {
        name: "-ar verbs mastery",
        scope: { tag: { slug: "lemma:hablar" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "-er verbs mastery",
        scope: { tag: { slug: "lemma:comer" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "-ir verbs mastery",
        scope: { tag: { slug: "lemma:vivir" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "Present tense mastery",
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 10` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "conjugation-practice",
        relations: {
          tags: {
            structural: { slug: "structural:a1" },
            target: [{ slug: "lemma:hablar" }, { slug: "lemma:comer" }, { slug: "lemma:vivir" }],
            context: [{ slug: "pos:noun" }],
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
              goal: "Create simple sentences using regular verbs. Focus on pattern recognition across -ar/-er/-ir.",
            },
          },
        },
      },
    },
  },

  {
    name: "High-Frequency Irregulars",
    slug: "common-irregulars",
    description: "Master the most common irregular verb patterns",
    preconditions: [{ scope: { dependency: { slug: "regular-verbs" } } }],
    conditions: [
      {
        name: "Tener mastery",
        scope: { tag: { slug: "lemma:tener" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Venir mastery",
        scope: { tag: { slug: "lemma:venir" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Salir mastery",
        scope: { tag: { slug: "lemma:salir" } },
        assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "e→ie changes",
        scope: { tag: { slug: "stem:e-ie" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
      {
        name: "o→ue changes",
        scope: { tag: { slug: "stem:o-ue" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5` },
      },
    ],
    itinerary: {
      tactic: {
        slug: "irregular-verb-practice",
        /* Tactic: irregular-verb-practice
           Input: High-frequency irregular verbs + their pattern tags
           Process: 1. Prose introduces each irregular pattern
                   2. Pattern recognition through conjugation tables
                   3. Mixed translation with regular & irregular verbs
                   4. Focus on high-frequency usage contexts
           Output: User can handle common irregulars while maintaining regular patterns
        */
      },
    },
  },
];

export default dependencies;
