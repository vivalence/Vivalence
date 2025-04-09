// Example constraints from verb conjugation tactic
const constraints = [
  "VERB: comer (to eat) - Must use this exact verb",
  "TENSE: preterite - Use simple past tense to describe a completed action",
  "MOOD: indicative - Express a factual completed action",
  "ASPECT: perfective - Show the action as completed",
  "PERSON: 1st person singular (yo) - The subject must be 'I'",
  "PATTERN: statement - Create a simple declarative sentence",
  "VERB FOCUS: The sentence should clearly demonstrate proper verb conjugation",
  "EXAMPLE FORM: 'comí' is the target form to practice (1st person preterite of comer)",
  "TEMPORAL MARKER: Include a time expression typical for preterite (like ayer, la semana pasada)",
  "COMPLEXITY: A1-A2 level vocabulary except for the target verb form",
  "CONTEXT: Use a typical eating situation that would naturally use preterite tense",
  "NOUN COMPLEMENT: Include a direct object that would commonly be eaten",
  "SENTENCE STRUCTURE: Subject + Verb + Object + Time Expression",
];

const dependencies = [
  {
    name: "Introduction to regular Verbs",
    slug: "verbs:101",
    description: `Practice regular verb endings on comer, hablar, vivir, correr, escribir, trabajar, estudiar, and escuchar, and their relationship with subject pronouns.`,
    preconditions: [{ scope: { dependency: { slug: "pronouns:101" } } }],
    conditions: [
      {
        name: "Present tense is learning (10)",
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 10` },
      },
      {
        name: "Indicative mood is learning (10)",
        scope: { tag: { slug: "mood:ind" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 10` },
      },
      {
        name: "Imperfect aspect is learning (10)",
        scope: { tag: { slug: "aspect:imp" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 10` },
      },
      {
        name: "First person is learning (3)",
        scope: { tag: { slug: "person:1" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Second person is learning (3)",
        scope: { tag: { slug: "person:2" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Third person is learning (3)",
        scope: { tag: { slug: "person:3" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 3` },
      },
      {
        name: "Singular is learning (6)",
        scope: { tag: { slug: "number:sing" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "Plural is learning (6)",
        scope: { tag: { slug: "number:plur" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 6` },
      },
      {
        name: "Hablar verb is learning (4)",
        scope: { tag: { slug: "lemma:hablar" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Comer verb is learning (4)",
        scope: { tag: { slug: "lemma:comer" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Vivir verb is learning (4)",
        scope: { tag: { slug: "lemma:vivir" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Correr verb is learning (4)",
        scope: { tag: { slug: "lemma:correr" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Escribir verb is learning (4)",
        scope: { tag: { slug: "lemma:escribir" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Trabajar verb is learning (4)",
        scope: { tag: { slug: "lemma:trabajar" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Estudiar verb is learning (4)",
        scope: { tag: { slug: "lemma:estudiar" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
      },
      {
        name: "Escuchar verb is learning (4)",
        scope: { tag: { slug: "lemma:escuchar" } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 4` },
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
            verbs: [
              { slug: "lemma:hablar" },
              { slug: "lemma:comer" },
              { slug: "lemma:vivir" },
              { slug: "lemma:correr" },
              { slug: "lemma:escribir" },
              { slug: "lemma:trabajar" },
              { slug: "lemma:estudiar" },
              { slug: "lemma:escuchar" },
            ],
          },
        },
        masks: {
          translations: {
            constraints: [`GRAMMAR: Always with the pronoun in spanish!`],
            goal: `Create simple sentences with subject pronouns and basic verb forms. One subject, one verb.`,
          },
        },
      },
    },
  },
  {
    name: "Introduction to irregular Verbs",
    slug: "verbs:102",
    description: `Practice subject pronouns and their relationship with irregular verb endings focusing on dar, tener, ir, leer, ver, venir, querer, poder, and poner`,
    preconditions: [{ scope: { dependency: { slug: "verbs:101" } } }],
    conditions: [
      {
        name: "Dar is learning (5)",
        scope: { tag: { slug: "lemma:dar" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Tener is learning (5)",
        scope: { tag: { slug: "lemma:tener" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Ir is learning (5)",
        scope: { tag: { slug: "lemma:ir" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Leer is learning (5)",
        scope: { tag: { slug: "lemma:leer" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Ver is learning (5)",
        scope: { tag: { slug: "lemma:ver" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Venir is learning (5)",
        scope: { tag: { slug: "lemma:venir" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Querer is learning (5)",
        scope: { tag: { slug: "lemma:querer" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Poder is learning (5)",
        scope: { tag: { slug: "lemma:poder" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Poner is learning (5)",
        scope: { tag: { slug: "lemma:poner" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 5" },
      },
      {
        name: "Present tense is learning (15)",
        scope: { tag: { slug: "tense:pres" } },
        assertion: { jsonata: "$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= 15" },
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
            verbs: [
              { slug: "lemma:dar" },
              { slug: "lemma:tener" },
              { slug: "lemma:ir" },
              { slug: "lemma:leer" },
              { slug: "lemma:ver" },
              { slug: "lemma:venir" },
              { slug: "lemma:querer" },
              { slug: "lemma:poder" },
              { slug: "lemma:poner" },
            ],
          },
        },
        masks: {
          translations: {
            constraints: [`GRAMMAR: Always with the pronoun in spanish!`],
            goal: "Create simple sentences using basic irregular verbs, focusing on their unique conjugation patterns in the present tense.",
          },
        },
      },
    },
  },
];

export default dependencies;
