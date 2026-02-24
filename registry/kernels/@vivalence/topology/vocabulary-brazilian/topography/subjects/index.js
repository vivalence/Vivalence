const noun = {
  slug: "noun",
  name: "Noun",
  description:
    "A word referring to persons, places, things, or concepts. Portuguese nouns inflect for gender and number.",
  dimensions: [
    { branch: ["pos", "noun"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "noun" } },
    { required: { branch: "gender" } },
    { required: { branch: "number" } },
  ],
};

const verb = {
  slug: "verb",
  name: "Verb",
  description:
    "A word expressing actions, states, or processes. Portuguese verbs inflect for person, number, tense, and mood.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["verbform"], required: true },
    { branch: ["tense"] },
    { branch: ["mood"] },
    { branch: ["person"] },
    { branch: ["number"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "verb" } },
    { required: { branch: "verbform" } },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "fin" } },
        then: [
          { required: { branch: "tense" } },
          { required: { branch: "mood" } },
          { required: { branch: "person" } },
          { required: { branch: "number" } },
        ],
      },
    },
  ],
};

const adj = {
  slug: "adj",
  name: "Adjective",
  description:
    "A word modifying nouns by describing qualities or attributes. Portuguese adjectives agree with nouns in gender and number.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
    { branch: ["degree"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adj" } },
    { required: { branch: "gender" } },
    { required: { branch: "number" } },
  ],
};

const pron = {
  slug: "pron",
  name: "Pronoun",
  description:
    "A word substituting for nouns or referring to participants in discourse. Portuguese pronouns inflect for person, number, and gender.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true },
    { branch: ["person"] },
    { branch: ["gender"] },
    { branch: ["number"] },
    { branch: ["reflex"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "pron" } },
    { required: { branch: "prontype" } },
  ],
};

const det = {
  slug: "det",
  name: "Determiner",
  description:
    "A word that introduces and specifies nouns. Portuguese determiners agree with nouns in gender and number.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
    { branch: ["numtype"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "det" } },
    { required: { branch: "prontype" } },
    { required: { branch: "gender" } },
    { required: { branch: "number" } },
  ],
};

const aux = {
  slug: "aux",
  name: "Auxiliary",
  description:
    "A helping verb used to form compound tenses or periphrastic constructions. Inflects like main verbs.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["verbform"], required: true },
    { branch: ["tense"] },
    { branch: ["mood"] },
    { branch: ["person"] },
    { branch: ["number"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "aux" } },
    { required: { branch: "verbform" } },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "fin" } },
        then: [
          { required: { branch: "tense" } },
          { required: { branch: "mood" } },
          { required: { branch: "person" } },
          { required: { branch: "number" } },
        ],
      },
    },
  ],
};

const adp = {
  slug: "adp",
  name: "Adposition",
  description:
    "A word showing spatial, temporal, or abstract relationships. Portuguese prepositions are invariant.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "adp" } }],
};

const adv = {
  slug: "adv",
  name: "Adverb",
  description: "A word modifying verbs, adjectives, other adverbs, or entire clauses.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["degree"] },
    { branch: ["polarity"] },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "adv" } }],
};

const num = {
  slug: "num",
  name: "Numeral",
  description:
    "A word expressing number or quantity. Portuguese numerals may show gender agreement.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["numtype"], required: true },
    { branch: ["gender"] },
    { branch: ["number"] },
    { branch: ["numform"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { required: { branch: "numtype" } },
  ],
};

const propn = {
  slug: "propn",
  name: "Proper Noun",
  description:
    "A word naming specific persons, places, or entities. Inflects for gender and number like common nouns.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
    { branch: ["nametype"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "propn" } },
    { required: { branch: "gender" } },
    { required: { branch: "number" } },
  ],
};

const cconj = {
  slug: "cconj",
  name: "Coordinating Conjunction",
  description: "A word connecting elements of equal syntactic status. Invariant in Portuguese.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "cconj" } }],
};

const sconj = {
  slug: "sconj",
  name: "Subordinating Conjunction",
  description: "A word introducing dependent clauses. Invariant in Portuguese.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"] },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "sconj" } }],
};

const part = {
  slug: "part",
  name: "Particle",
  description:
    "A function word that doesn't fit other categories. Includes negation, discourse markers, and interjections.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["polarity"] },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "part" } }],
};

const punct = {
  slug: "punct",
  name: "Punctuation",
  description: "Orthographic symbols marking sentence structure and prosody.",
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
  ],
  relations: [{ unique: { branch: "pos" } }, { required: { branch: "pos", leaf: "punct" } }],
};

export default [noun, verb, adj, pron, det, aux, adp, adv, num, propn, cconj, sconj, part, punct];
