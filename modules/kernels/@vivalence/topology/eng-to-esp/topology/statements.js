const patterns = {
  statement: {
    id: "statement",
    description: "Basic declarative sentence pattern",
    examples: [
      "Yo como pan todos los días. | I eat bread every day.",
      "Mi hermano trabaja en un banco. | My brother works at a bank.",
    ],
    activation: "When 'pattern:statement' is selected, create a simple declarative sentence",
  },

  question: {
    id: "question",
    description: "Interrogative sentence pattern",
    examples: [
      "¿Dónde vives tú? | Where do you live?",
      "¿Cuándo llegará el tren? | When will the train arrive?",
    ],
    activation:
      "When 'pattern:question' is selected, create a question using the appropriate interrogative structure",
  },

  negation: {
    id: "negation",
    description: "Negative sentence pattern",
    examples: [
      "Yo no hablo japonés. | I don't speak Japanese.",
      "Ellos nunca van al cine. | They never go to the cinema.",
    ],
    activation: "When 'pattern:negation' is selected, create a sentence with proper negation",
  },

  temporal: {
    id: "temporal",
    description: "Sentences emphasizing time expressions",
    examples: [
      "Mañana iré al médico. | Tomorrow I will go to the doctor.",
      "La semana pasada visité a mis abuelos. | Last week I visited my grandparents.",
    ],
    activation:
      "When 'pattern:temporal' is selected, include a time expression appropriate to the tense",
  },

  conditional: {
    id: "conditional",
    description: "If-then conditional constructions",
    examples: [
      "Si llueve, llevaré un paraguas. | If it rains, I will take an umbrella.",
      "Si tuviera tiempo, estudiaría más. | If I had time, I would study more.",
    ],
    activation:
      "When 'pattern:conditional' is selected, create a conditional sentence with both clauses",
  },

  comparative: {
    id: "comparative",
    description: "Comparison between two elements",
    examples: [
      "Mi hermana es más alta que yo. | My sister is taller than me.",
      "Este libro es menos interesante que el otro. | This book is less interesting than the other one.",
    ],
    activation: "When 'pattern:comparative' is selected, include a proper comparison structure",
  },

  modal: {
    id: "modal",
    description: "Sentences using modal verbs or expressions",
    examples: [
      "Debes estudiar más. | You must study more.",
      "Podría llover mañana. | It might rain tomorrow.",
    ],
    activation:
      "When 'pattern:modal' is selected, include the appropriate modal verb or expression",
  },

  reflexive: {
    id: "reflexive",
    description: "Sentences with reflexive verbs or pronouns",
    examples: [
      "Me lavo las manos cada día. | I wash my hands every day.",
      "Nos vemos mañana en la escuela. | We'll see each other tomorrow at school.",
    ],
    activation:
      "When 'pattern:reflexive' is selected, use a reflexive verb with proper pronoun agreement",
  },

  imperative: {
    id: "imperative",
    description: "Command or request sentences",
    examples: [
      "Cierra la puerta, por favor. | Close the door, please.",
      "No hables tan alto. | Don't speak so loudly.",
    ],
    activation:
      "When 'pattern:imperative' is selected, form a command with the appropriate verb form",
  },
};
