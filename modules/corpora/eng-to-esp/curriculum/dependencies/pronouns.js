// Example constraints from pronouns tactic
const constraints = [
  "PRONOUN TYPE: possessive - Focus on possessive pronoun usage",
  "PRONOUN FORM: su/sus (his/her/their) - Use third person possessive",
  "PRONOUN FUNCTION: determination - Show ownership of an object",
  "VERB: tener (to have) - Use with a simple high-frequency verb",
  "TENSE: present - For simplicity, use present tense",
  "PATTERN: statement - Use a simple declarative sentence",
  "PRONOUN PLACEMENT: Demonstrate correct positioning before the noun",
  "GENDER AGREEMENT: Show proper agreement between possessive and the possessed noun",
  "NUMBER AGREEMENT: Show agreement between singular/plural possessive forms and nouns",
  "CLARITY: The possessor should be clear from context",
  "COMPLEXITY: A1 level vocabulary for all words except the pronoun structure",
  "EXAMPLE STRUCTURE: 'Ella tiene su libro.' (She has her book)",
  "CONTEXT: Everyday objects or family members that might be possessed",
  "POSSESSOR-POSSESSED RELATION: Make it clear who owns what in the sentence",
];
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
